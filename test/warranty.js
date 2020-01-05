const Warranty = artifacts.require("./Warranty.sol")
Warranty.numberFormat = "BigNumber"
const BigNumber = require('bignumber.js')
const chai = require("chai")
const { assert, expect } = chai
const truffleAssert = require('truffle-assertions')
const chaiBigNumber = require('chai-bignumber')
chai.use(chaiBigNumber(BigNumber))
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const { _, toWei } = web3.utils

contract("Warranty", (accounts) => {
  let warranty
  beforeEach(async () => {
    warranty = await Warranty.new({
      from: accounts[0]
    })
  })
  afterEach(async () => {
    warranty = null
  })
  describe('#createAndGuaranteeClaim()', () => {
    it("should fund a warranty", async () => {
      const createTx = await warranty.createAndGuaranteeClaim(accounts[1], 50, 3, {
        from: accounts[0],
        value: 5
      })
      const tokenId = getTokenId(createTx, accounts[1])
      // check when the warranty will expire
      const expireTime = await warranty.claimExpireTime(tokenId)
      // it should be a non zero number (at max 3)
      const timeToClaimExpire = await warranty.timeToClaimExpire(tokenId)
      expect(timeToClaimExpire).to.be.bignumber.at.most(3)
      expect(timeToClaimExpire).to.be.bignumber.at.least(1)
      // wait the amount of time that the blockchain says should be waited
      await timeoutUntil(expireTime * 1000)
      // check again, should be zero
      expect(await warranty.timeToClaimExpire(tokenId)).to.be.bignumber.equal(0)
    })
  })
  describe('#redeemClaim()', () => {
    it('should be able to mark a warranty as redeemed #redeemClaim()', async () => {
      const createTx = await warranty.createAndGuaranteeClaim(accounts[1], 50, 10, {
        from: accounts[0],
        value: 5
      })
      const tokenId = getTokenId(createTx, accounts[1])
      await throws(warranty.redeemClaim(tokenId, {
        from: accounts[2]
      }), 'sender must be the owner of the token')
      await warranty.redeemClaim(tokenId, {
        from: accounts[1]
      })
      const claim = await warranty._claims(tokenId)
      expect(claim.redeemed).to.be.equal(true)
      expect(claim.fulfilled).to.be.equal(false)
    })
  })
  describe('#terminateClaim()', () => {
    it('should decay the value returned to token holder linearly', async () => {
      const createTx = await warranty.createAndGuaranteeClaim(accounts[1], 50, 10, {
        from: accounts[0],
        value: 10
      })
      const tokenId = getTokenId(createTx, accounts[1])
      const expireTime = await warranty.claimExpireTime(tokenId)
      await timeoutUntil((expireTime - 8) * 1000)
      await warranty.terminateClaim(tokenId, {
        from: accounts[0]
      })
      const balance = await warranty.balance(accounts[1])
      // as long as this happens within a second, should be 4, otherwise will continue to decay to 35, 30, 25, etc
      expect(balance).to.be.bignumber.equal(8)
      const ownerBalance = await warranty.balance(accounts[0])
      expect(ownerBalance).to.be.bignumber.equal(2)
    })
    it('unlocked funds can be released', async () => {
      const valuation = toWei('5', 'ether')
      const createTx = await warranty.createAndGuaranteeClaim(accounts[1], valuation, 10, {
        from: accounts[0],
        value: toWei('0.5', "ether")
      })
      const tokenId = getTokenId(createTx, accounts[1])
      await timeoutUntil(((await warranty.claimExpireTime(tokenId)) - 6) * 1000)
      await warranty.terminateClaim(tokenId, {
        from: accounts[0]
      })
      const customerBalance = await warranty.balance(accounts[1])
      // as long as this happens within a second, should be 40, otherwise will continue to decay to 35, 30, 25, etc
      expect(customerBalance).to.be.bignumber.equal(toWei('0.3', "ether"))
      const ownerBalance = await warranty.balance(accounts[0])
      expect(ownerBalance).to.be.bignumber.equal(toWei('0.2', "ether"))
      // cache previous balances to be used below
      const balance0 = new BigNumber(await web3.eth.getBalance(accounts[0]))
      const balance1 = new BigNumber(await web3.eth.getBalance(accounts[1]))
      // funds can be released at the pleasure of the actor
      await Promise.all([
        warranty.releaseTo(accounts[0], ownerBalance.toString(), { from: accounts[0] }),
        warranty.releaseTo(accounts[1], customerBalance.toString(), { from: accounts[1] })
      ])
      // check that nothing was left in the contract
      expect(await warranty.balance(accounts[0])).to.be.bignumber.equal('0')
      expect(await warranty.balance(accounts[1])).to.be.bignumber.equal('0')
      // approximate the value transfer minus gas
      const balanceAfter0 = await web3.eth.getBalance(accounts[0])
      const balanceAfter1 = await web3.eth.getBalance(accounts[1])
      expect(balanceAfter0).to.be.bignumber.at.least(balance0.plus(toWei('0.199', 'ether')))
      expect(balanceAfter0).to.be.bignumber.at.most(balance0.plus(toWei('0.2', 'ether')))
      expect(balanceAfter1).to.be.bignumber.at.least(balance1.plus(toWei('0.299', 'ether')))
      expect(balanceAfter1).to.be.bignumber.at.most(balance1.plus(toWei('0.3', 'ether')))
    })
    it('deposits the same amount in funds no matter how long after the claim expires', async () => {
      const createTx = await warranty.createAndGuaranteeClaim(accounts[1], 10000, 2, {
        from: accounts[0],
        value: 1000
      })
      const tokenId = getTokenId(createTx, accounts[1])
      await timeoutUntil(await warranty.claimExpireTime(tokenId) * 1000)
      await timeout(5000) // 5 blocks "go by"
      await warranty.terminateClaim(tokenId, {
        from: accounts[0]
      })
      expect(await warranty.balance(accounts[0])).to.be.bignumber.equal(1000)
      expect(await warranty.balance(accounts[1])).to.be.bignumber.equal(0)
    })
  })
  describe('#fulfilled()', () => {
    it('can be fullfilled by the warrantor', async () => {
      const createTx = await warranty.createAndGuaranteeClaim(accounts[1], 10000, 60, {
        from: accounts[0],
        value: 1000
      })
      const tokenId = getTokenId(createTx, accounts[1])
      await timeout(1000)
      await throws(warranty.fulfill(accounts[1], tokenId, {
        from: accounts[0],
        value: 8999
      }), "claim can only be fullfilled for the original agreed upon valuation")
      await warranty.fulfill(accounts[1], tokenId, {
        from: accounts[0],
        value: 9000
      })
      expect(await warranty.balance(accounts[0])).to.be.bignumber.equal(0)
      expect(await warranty.balance(accounts[1])).to.be.bignumber.equal(10000)
    })
    it('can be provided more than enough value', async () => {
      const createTx1 = await warranty.createAndGuaranteeClaim(accounts[1], 10000, 60, {
        from: accounts[0],
        value: 1000
      })
      const tokenId1 = getTokenId(createTx1, accounts[1])
      await timeout(1000)
      await warranty.fulfill(accounts[1], tokenId1, {
        from: accounts[0],
        value: 18000
      })
      expect(await warranty.balance(accounts[0])).to.be.bignumber.equal(9000)
      expect(await warranty.balance(accounts[1])).to.be.bignumber.equal(10000)
      // create another one
      const createTx2 = await warranty.createAndGuaranteeClaim(accounts[1], 10000, 60, {
        from: accounts[0],
        value: 1000
      })
      const tokenId2 = getTokenId(createTx2, accounts[1])
      await timeout(1000)
      // sending zero value
      await warranty.fulfill(accounts[1], tokenId2, {
        from: accounts[0],
        value: 0
      })
      expect(await warranty.balance(accounts[0])).to.be.bignumber.equal(0)
      expect(await warranty.balance(accounts[1])).to.be.bignumber.equal(20000)
    })
  })
})

function getTokenId(createTx, recipient) {
  let tokenId
  truffleAssert.eventEmitted(createTx, "Transfer", (ev) => {
    tokenId = ev.tokenId
    return web3.utils.toDecimal(ev.from) === 0 && recipient === ev.to;
  })
  return tokenId
}

async function throws(promise, reason) {
  try {
    await promise
  } catch (e) {
    if (!reason) {
      console.log(e)
    }
    expect(e.reason).to.be.equal(reason)
  }
}

function timeoutUntil(ms) {
  const mil = ms - (new Date())
  return timeout(mil)
}

function timeout(ms) {
  return new Promise((resolve) => _.delay(resolve, ms))
}

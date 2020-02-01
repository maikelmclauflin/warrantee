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
  describe('#createAndFundClaim()', () => {
    it("should fund a warranty", async () => {
      /*
        this is to test basic warranty creation and check that the 
        contract understands that the value of a contract decays
        and eventually goest to zero
      */
      const createTx = await warranty.createAndFundClaim(accounts[0], accounts[1], 50, 3, "", "", {
        from: accounts[0],
        value: 5
      })
      const tokenId = getTokenId(createTx, accounts[0])
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
      /*
        checked to make sure that a contract could redeem a claim
      */
      const createTx = await warranty.createAndFundClaim(accounts[0], accounts[1], 50, 10, "", "", {
        from: accounts[0],
        value: 5
      })
      const tokenId = getTokenId(createTx, accounts[0])
      await throws(warranty.redeemClaim(tokenId, {
        from: accounts[2]
      }), 'sender must be the owner of the token')
      await throws(warranty.redeemClaim(tokenId, {
        from: accounts[1]
      }), 'sender must be the owner of the token')
      await warranty.redeemClaim(tokenId, {
        from: accounts[0]
      })
      const claim = await warranty._claims(tokenId)
      expect(claim.redeemed).to.be.equal(true)
      expect(claim.fulfilled).to.be.equal(false)
    })
  })
  describe('#guaranteeClaim()', () => {
    it('should be able to claim ownership over a token, only if the ether is replaced', async () => {
      /*
        checked to make sure that the ownership of a token could be changed from one account to another
        and that the metadata does not get locked as it moves from state to state
      */
      const createTx = await warranty.createAndFundClaim(accounts[0], accounts[1], 50, 10000, "", "", {
        from: accounts[0],
        value: 10
      })
      const tokenId = getTokenId(createTx, accounts[0])

      expect(await warranty.ownerOf(tokenId)).to.be.equal(accounts[0])
      let transferringTo = await warranty._pendingTransfer(tokenId)
      expect(transferringTo).to.be.equal('0x0000000000000000000000000000000000000000')

      await warranty.postClaim(tokenId, accounts[2], {
        from: accounts[0]
      })

      expect(await warranty.ownerOf(tokenId)).to.be.equal(accounts[0])
      transferringTo = await warranty._pendingTransfer(tokenId)
      expect(transferringTo).to.be.equal(accounts[2])

      await throws(warranty.guaranteeClaim(tokenId, 1, {
        from: accounts[2],
        value: 1
      }), "available credit must meet or exceed claim value")
      await warranty.guaranteeClaim(tokenId, 10, {
        from: accounts[2],
        value: 10
      })

      expect(await warranty.ownerOf(tokenId)).to.be.equal(accounts[2])
      transferringTo = await warranty._pendingTransfer(tokenId)
      expect(transferringTo).to.be.equal('0x0000000000000000000000000000000000000000')
    })
  })
  describe('#terminateClaim()', () => {
    it('should decay the value returned to token holder linearly', async () => {
      /*
        checks to make sure that a claim divides its value if it is terminated within its expiry time
      */
      const createTx = await warranty.createAndFundClaim(accounts[0], accounts[1], 50, 10, "", "", {
        from: accounts[0],
        value: 10
      })
      const tokenId = getTokenId(createTx, accounts[0])
      const expireTime = await warranty.claimExpireTime(tokenId)
      await timeoutUntil((expireTime - 8) * 1000)
      await warranty.terminateClaim(tokenId, {
        from: accounts[0]
      })
      const balance = await warranty.balance(accounts[1])
      expect(balance).to.be.bignumber.equal(2)
      const ownerBalance = await warranty.balance(accounts[0])
      expect(ownerBalance).to.be.bignumber.equal(8)
    })
    it('unlocked funds can be released', async () => {
      /*
        check to make sure that funds assigned to an account and not a claim can be released
      */
      const valuation = toWei('5', 'ether')
      const createTx = await warranty.createAndFundClaim(accounts[0], accounts[1], valuation, 10, "", "", {
        from: accounts[0],
        value: toWei('0.5', "ether")
      })
      const tokenId = getTokenId(createTx, accounts[0])
      await timeoutUntil(((await warranty.claimExpireTime(tokenId)) - 6) * 1000)
      await warranty.terminateClaim(tokenId, {
        from: accounts[0]
      })
      const customerBalance = await warranty.balance(accounts[0])
      expect(customerBalance).to.be.bignumber.equal(toWei('0.3', "ether"))
      const businessBalance = await warranty.balance(accounts[1])
      expect(businessBalance).to.be.bignumber.equal(toWei('0.2', "ether"))
      // cache previous balances to be used below
      const balance0 = new BigNumber(await web3.eth.getBalance(accounts[0]))
      const balance1 = new BigNumber(await web3.eth.getBalance(accounts[1]))
      // funds can be released at the pleasure of the actor
      await Promise.all([
        warranty.releaseTo(accounts[0], customerBalance.toString(), { from: accounts[0] }),
        warranty.releaseTo(accounts[1], businessBalance.toString(), { from: accounts[1] })
      ])
      // check that nothing was left in the contract
      expect(await warranty.balance(accounts[0])).to.be.bignumber.equal('0')
      expect(await warranty.balance(accounts[1])).to.be.bignumber.equal('0')
      // approximate the value transfer minus gas
      const balanceAfter0 = new BigNumber(await web3.eth.getBalance(accounts[0]))
      const balanceAfter1 = new BigNumber(await web3.eth.getBalance(accounts[1]))
      expect(balanceAfter0.minus(balance0)).to.be.bignumber.at.least(toWei('0.299', 'ether'))
      expect(balanceAfter0.minus(balance0)).to.be.bignumber.at.most(toWei('0.3', 'ether'))
      expect(balanceAfter1.minus(balance1)).to.be.bignumber.at.least(toWei('0.199', 'ether'))
      expect(balanceAfter1.minus(balance1)).to.be.bignumber.at.most(toWei('0.2', 'ether'))
    })
    it('deposits the same amount in funds no matter how long after the claim expires', async () => {
      /*
        credits are still applied no matter how long after the token expires
      */
      const createTx = await warranty.createAndFundClaim(accounts[0], accounts[1], 10000, 2, "", "", {
        from: accounts[0],
        value: 1000
      })
      const tokenId = getTokenId(createTx, accounts[0])
      const expiryTime = await warranty.claimExpireTime(tokenId)
      await timeoutUntil(expiryTime * 1000)
      await timeout(5000) // 5 blocks "go by"
      await warranty.terminateClaim(tokenId, {
        from: accounts[0]
      })
      expect(await warranty.balance(accounts[1])).to.be.bignumber.equal(1000)
      expect(await warranty.balance(accounts[0])).to.be.bignumber.equal(0)
    })
  })
  describe('#fulfillClaim()', () => {
    it('can be fullfilled by the warrantor', async () => {
      /*
        the token can be fulfilled by the warrantor instead of the warrantee...
        even if that generally doesn't happen in real life
        in this test i also ensure that one probi too few results in a failure.
      */
      const createTx = await warranty.createAndFundClaim(accounts[0], accounts[1], 10000, 60, "", "", {
        from: accounts[0],
        value: 1000
      })
      const tokenId = getTokenId(createTx, accounts[0])
      await timeout(1000)
      await throws(warranty.fulfillClaim(accounts[0], tokenId, {
        from: accounts[1],
        value: 8999
      }), "claim can only be fullfilled for the original agreed upon valuation")
      await warranty.fulfillClaim(accounts[0], tokenId, {
        from: accounts[1],
        value: 9000
      })
      expect(await warranty.balance(accounts[1])).to.be.bignumber.equal(0)
      expect(await warranty.balance(accounts[0])).to.be.bignumber.equal(10000)
    })
    it('can be provided more than enough value', async () => {
      /*
        excess value is applied to the user's credit and is applied whenever enough eth is not provided in the transaction
        this is important because warranties can be quite large, especially after just completing a large purchase
        it doesn't make sense to shuffle monies around just to get your warranty
      */
      const createTx1 = await warranty.createAndFundClaim(accounts[0], accounts[1], 10000, 60, "", "", {
        from: accounts[0],
        value: 1000
      })
      const tokenId1 = getTokenId(createTx1, accounts[0])
      await timeout(1000)
      await warranty.fulfillClaim(accounts[0], tokenId1, {
        from: accounts[1],
        value: 18000
      })
      expect(await warranty.balance(accounts[1])).to.be.bignumber.equal(9000)
      expect(await warranty.balance(accounts[0])).to.be.bignumber.equal(10000)
      // create another one
      const createTx2 = await warranty.createAndFundClaim(accounts[0], accounts[1], 10000, 60, "", "", {
        from: accounts[0],
        value: 1000
      })
      const tokenId2 = getTokenId(createTx2, accounts[0])
      await timeout(1000)
      // sending zero value
      await warranty.fulfillClaim(accounts[0], tokenId2, {
        from: accounts[1],
        value: 0
      })
      expect(await warranty.balance(accounts[1])).to.be.bignumber.equal(0)
      expect(await warranty.balance(accounts[0])).to.be.bignumber.equal(20000)
    })
  })
  describe('#createClaim()', () => {
    it('can just create a claim to be claimed later', async () => {
      /*
        sometimes a token doesn't need to be filled right away.
        perhaps the ratio of how much eth that should be applied to that token hasn't been determined yet.
        In that case, just create the warranty, and sit on it until you know, then you can fund it. the Activated time will not be set until a warrantor is
      */
      const createTx1 = await warranty.createClaim(accounts[0], 10000, 60, "", "", {
        from: accounts[0]
      })
      const tokenId1 = getTokenId(createTx1, accounts[0])
      await warranty.fundClaim(tokenId1, 1000, {
        from: accounts[0],
        value: 1000
      })
      await warranty.transferWarrantorship(tokenId1, accounts[1], {
        from: accounts[0],
      })
      await warranty.postClaim(tokenId1, accounts[2], {
        from: accounts[0],
      })
      await warranty.guaranteeClaim(tokenId1, 1000, {
        from: accounts[2],
        value: 1000
      })
      const claim = await warranty._claims(tokenId1)
      expect(claim.value).to.be.bignumber.equal(1000)
      await throws(warranty.guaranteeClaim(tokenId1, 1000, {
        from: accounts[2],
        value: 1000,
      }), "unable to hand off claim unless it is first posted for transfer")
    })
  })
  describe('#fallback()', () => {
    it('fails', async () => {
      /*
        check to make sure that the fallback rejects the transaction
        value is credited to the user that sent the funds
      */
      await throws(web3.eth.sendTransaction({
        from: accounts[0],
        to: warranty.address,
        value: 10001,
        // fallback function
        data: "",
      }))
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
  return timeout(ms - (new Date()))
}

function timeout(ms) {
  return new Promise((resolve) => _.delay(resolve, ms))
}

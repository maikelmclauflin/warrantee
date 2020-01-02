
const Warrantee = artifacts.require("./Warrantee.sol")
Warrantee.numberFormat = "BigNumber"
const _ = web3.utils._
const assert = require("chai").assert
const truffleAssert = require('truffle-assertions')

contract("Warrantee", (accounts) => {
  let warrantee
  beforeEach(async () => {
    warrantee = await Warrantee.new({
      from: accounts[0]
    })
  })
  afterEach(async () => {
    await warrantee.renounceOwnership({
      from: accounts[0]
    })
  })
  it("should fund a warranty", async () => {
    await warrantee.create(accounts[1], 50, 1, {
      from: accounts[0],
      value: 5
    })
    assert.equal('50', (await warrantee.outstanding(false)).toString())

    await warrantee.create(accounts[1], 100, 2, {
      from: accounts[0],
      value: 10
    })
    assert.equal('150', (await warrantee.outstanding(false)).toString())
    assert.equal('150', (await warrantee.outstanding(true)).toString())
    await timeout(1200)
    assert.equal('100', (await warrantee.outstanding(false)).toString())
    assert.equal('150', (await warrantee.outstanding(true)).toString())
    await timeout(1500)
    assert.equal('0', (await warrantee.outstanding(false)).toString())
    assert.equal('150', (await warrantee.outstanding(true)).toString())
  })
  it('should be able to claim a warranty #claim()', async () => {
    const createTx = await warrantee.create(accounts[1], 50, 10, {
      from: accounts[0],
      value: 5
    })
    truffleAssert.eventEmitted(createTx, "Transfer", (ev) => {
      return web3.utils.toDecimal(ev.from) === 0 && ev.to === accounts[1]
    })
    assert.equal(1, createTx.logs.length, "only one event is emitted")
    assert.equal('50', (await warrantee.outstanding(false)).toString())
    const tokenId = createTx.logs[0].args[2].toNumber()
    const claimTx = await warrantee.claim(tokenId, {
      from: accounts[1]
    })
    truffleAssert.eventEmitted(claimTx, "Terminated", (ev) => {
      return ev.tokenId.toNumber() === tokenId
    })
    assert.equal('0', (await warrantee.outstanding(false)).toString())
    assert.equal('0', (await warrantee.outstanding(true)).toString())
  })
  it('should decay the value returned linearly', async () => {
    const createTx = await warrantee.create(accounts[1], 50, 10, {
      from: accounts[0],
      value: 5
    })
    await timeout(2000)
    const tokenId = createTx.logs[0].args[2].toNumber()
    await warrantee.terminateAgreement(tokenId, {
      from: accounts[0]
    })
    const balance = await warrantee.balance(accounts[1])
    // as long as this happens within a second, should be 40, otherwise will continue to decay to 35, 30, 25, etc
    assert.equal(balance.toNumber(), 4)
    const ownerBalance = await warrantee.balance(accounts[0])
    assert.equal(ownerBalance.toNumber(), 1)
  })
})

function timeout(ms) {
  return new Promise((resolve) => _.delay(resolve, ms))
}


import _ from 'lodash'
import BigNumber from 'bignumber.js'

const claims = {}

export class Claim {
  constructor(id, web3, contract) {
    this.id = id
    this.web3 = web3
    this.contract = contract
  }
  async fetch() {
    const { id, contract } = this
    const stored = claims[id]
    if (stored && stored.warrantee) {
      return stored
    }
    const { methods } = contract
    const [warrantee, claim] = await Promise.all([
      methods.ownerOf(id).call(),
      methods._claims(id).call(),
    ])
    if (!claim) {
      throw new Error('claim not found')
    }
    this.initialize(warrantee, claim)
    claims[id] = this
    return this
  }
  update() {
    deleteClaim(this.id)
    return this.clone().fetch()
  }
  clone() {
    return new Claim(this.id, this.web3, this.contract)
  }
  initialize(warrantee, claim) {
    // mutate in place ok
    Object.assign(this, claim, {
      warrantee
    })
  }
  exists() {
    return !!this.warrantor
  }
  activatedTime() {
    return this.activatedAt
  }
  expiredTime() {
    const activatedTime = new BigNumber(this.activatedAt)
    const expiresAfterTime = new BigNumber(this.expiresAfter)
    return activatedTime.plus(expiresAfterTime)
  }
  progress(value = _.now()) {
    const activatedTime = new BigNumber(this.activatedAt).times(1000)
    const expiresAfterTime = new BigNumber(this.expiresAfter).times(1000)
    const expireTime = activatedTime.plus(expiresAfterTime)
    const progressDenominator = expireTime.minus(activatedTime)
    const progressNumerator = new BigNumber(value).minus(activatedTime)
    return BigNumber.min(progressNumerator.dividedBy(progressDenominator), 1)
  }
  can(key) {
    if (key === 'terminate') {
      return !this.terminated
    }
    if (key === 'redeem') {
      return !this.terminated && !this.redeemed
    }
    if (key === 'deredeem') {
      return !this.terminated && this.redeemed
    }
    if (key === 'fulfill') {
      return !this.terminated
    }
    if (key === 'fund') {
      return this.expiredTime().times(1000).isGreaterThan(_.now()) && !this.terminated
    }
  }
  states() {
    return ['terminated', 'fulfilled', 'redeemed'].reduce((memo, key) => {
      if (this[key]) return memo.concat(key)
      return memo
    }, [])
  }
}

export function resetClaimCache() {
  _.forOwn(claims, (claim, key) => {
    delete claims[key]
  })
}

export function deleteClaim(id) {
  delete claims[id]
}

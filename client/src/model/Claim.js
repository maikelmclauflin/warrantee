import { toDate } from '../utils'
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
        if (stored && stored.owner) {
            return stored
        }
        const { methods } = contract
        const [owner, claim] = await Promise.all([
            methods.ownerOf(id).call(),
            methods._claims(id).call()
        ])
        if (!claim) {
            throw new Error('claim not found')
        }
        this.initialize(owner, claim)
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
    initialize(owner, claim) {
        // mutate in place ok
        Object.assign(this, claim, {
            owner
        })
    }
    exists() {
        return !!this.warrantor
    }
    activatedTime() {
        return toDate(this.activatedAt)
    }
    expiredTime() {
        const activatedTime = new BigNumber(this.activatedAt)
        const expiresAfterTime = new BigNumber(this.expiresAfter)
        const expireTime = activatedTime.plus(expiresAfterTime)
        return toDate(expireTime)
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
    }
    states() {
        return ['terminated', 'fulfilled', 'redeemed'].reduce((memo, key) => {
            if (this[key]) return memo.concat(key)
            return memo
        }, [])
    }
}

export function deleteClaim(id) {
    delete claims[id]
}

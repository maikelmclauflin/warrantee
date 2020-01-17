import { toDate } from '../utils'
import _ from 'lodash'
import BigNumber from 'bignumber.js'
export class Claim {
    constructor(id, web3, contract) {
        this.id = id
        this.web3 = web3
        this.contract = contract
    }
    async setup() {
        const { id, contract } = this
        const { methods } = contract
        const [owner, claim] = await Promise.all([
            methods.ownerOf(id).call(),
            methods._claims(id).call()
        ])
        this.initialize(owner, claim)
    }
    initialize(owner, claim) {
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
}
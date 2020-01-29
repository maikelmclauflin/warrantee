import BigNumber from 'bignumber.js'
import joi from './extended'

export const create = joi.object().keys({
  warrantee: joi.string().required(),
  warrantor: joi.string().required(),
  valuation: joi.bigNumber().required(),
  value: joi.bigNumber().required(),
  expiresAfter: joi.bigNumber()
    .required()
    .greaterThanOrEqualTo(60)
    .lessThan(new BigNumber(1000000000000)),
}).required()

export const deredeem = joi.object().keys({
  expiryTime: joi.bigNumber().required(),
  delayTime: joi.bigNumber().required(),
}).required()

export const fulfill = joi.object().keys({
  value: joi.bigNumber().required(),
  address: joi.string(),
}).required()

export const fund = joi.object().keys({
  id: joi.bigNumber().required().greaterThanOrEqualTo(0),
  value: joi.bigNumber().required().greaterThanOrEqualTo((new BigNumber(1)).dividedBy(1e18)),
}).required()

export const guarantee = joi.object().keys({
  id: joi.bigNumber().required().greaterThanOrEqualTo(0),
  value: joi.bigNumber().required().greaterThanOrEqualTo(0),
}).required()

export const transfer = joi.object().keys({
  id: joi.bigNumber().required().greaterThanOrEqualTo(0),
  value: joi.bigNumber().required().greaterThanOrEqualTo(0),
}).required()

import BigNumber from 'bignumber.js'
import joi from './extended'

export const create = joi.object().keys({
  warrantee: joi.string().required(),
  warrantor: joi.string().required(),
  valuation: joi.bigNumber().required(),
  value: joi.bigNumber().optional(),
  expiresAfter: joi.bigNumber()
    .required()
    .greaterThanOrEqualTo(60)
    .lessThan(new BigNumber(1000000000000)),
  notes: joi.string().optional(),
  tokenURI: joi.string().optional(),
}).required()

export const deredeem = joi.object().keys({
  expiryTime: joi.bigNumber().required(),
  delayTime: joi.bigNumber().required(),
}).required()

export const fulfill = joi.object().keys({
  value: joi.bigNumber().required(),
  address: joi.string().min(1),
}).required()

export const fund = joi.object().keys({
  id: joi.bigNumber().required().greaterThanOrEqualTo(0),
  value: joi.bigNumber().required().greaterThanOrEqualTo((new BigNumber(1)).dividedBy(1e18)),
}).required()

export const guarantee = joi.object().keys({
  id: joi.bigNumber().required().greaterThanOrEqualTo(0),
  back: joi.bigNumber().required().greaterThanOrEqualTo(0),
  value: joi.bigNumber().required().greaterThanOrEqualTo(0),
}).required()

export const post = joi.object().keys({
  id: joi.bigNumber().required().greaterThanOrEqualTo(0),
  account: joi.string().min(1),
}).required()

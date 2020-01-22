import BigNumber from 'bignumber.js'
import joi from './extended'

export const create = joi.object().keys({
  owner: joi.string().required(),
  valuation: joi.bigNumber().required(),
  value: joi.bigNumber().required(),
  expiresAfter: joi.bigNumber().required().greaterThanOrEqualTo(30),
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

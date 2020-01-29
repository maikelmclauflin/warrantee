import Joi from '@hapi/joi'
import BigNumber from 'bignumber.js'

const baseArg = {
  name: 'base',
  ref: false,
  assert: (value) => value !== '' && !isNaN(+value) && !isNaN(parseFloat(value)),
  message: 'must be a number'
}
const joi = Joi.extend((joi) => ({
  type: 'bigNumber',
  base: Joi.string(),
  messages: {
    'bigNumber.not': '"{{#label}}" must be a number',
    'bigNumber.greaterThanOrEqualTo': '"{{#label}}" must be greaterThanOrEqualTo {{#base}}',
    'bigNumber.lessThan': '"{{#label}}" must be lessThan {{#base}}'
  },
  validate(value, helpers) {
    // Base validation regardless of the rules applied
    if (value === '' || isNaN(+value)) {
      return {
        value,
        errors: helpers.error('bigNumber.not')
      }
    }
  },
  rules: {
    lessThan: {
      args: [baseArg],
      method(base) {
        return this.$_addRule({ name: 'lessThan', args: { base } });
      },
      validate(value, helpers, args) {
        if ((new BigNumber(value)).isLessThan(args.base)) {
          return value
        }
        return helpers.error('bigNumber.lessThan', { base: args.base })
      }
    },
    greaterThanOrEqualTo: {
      args: [baseArg],
      method(base) {
        return this.$_addRule({ name: 'greaterThanOrEqualTo', args: { base } });
      },
      validate(value, helpers, args) {
        if ((new BigNumber(value)).isGreaterThanOrEqualTo(args.base)) {
          return value
        }
        return helpers.error('bigNumber.greaterThanOrEqualTo', { base: args.base })
      }
    }
  }
}))

export default joi

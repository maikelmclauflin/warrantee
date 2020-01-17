import React, { Component } from "react";
import {
    Input,
    Button,
    Form as RimbleForm,
    ToastMessage,
    Flex,
    Box,
    Card,
    Field
} from 'rimble-ui';
import BigNumber from 'bignumber.js'
// import walletAddressValidator from 'wallet-address-validator'
import Joi from '@hapi/joi'
const { Provider, Consumer } = React.createContext({});
const joi = Joi.extend((joi) => ({
    type: 'bigNumber',
    base: Joi.string(),
    messages: {
        'bigNumber.not': '"{{#label}}" must be a number',
        'bigNumber.greaterThanOrEqualTo': '"{{#label}}" must be greaterThanOrEqualTo {{#base}}'
    },
    validate(value, helpers) {
        // Base validation regardless of the rules applied
        if (isNaN(+value)) {
            return {
                value,
                errors: helpers.error('bigNumber.not')
            }
        }
    },
    rules: {
        greaterThanOrEqualTo: {
            // convert: true,
            args: [{
                name: 'base',
                ref: true,
                assert: (value) => !isNaN(+value),
                message: 'must be a number'
            }],
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
const createSchema = joi.object().keys({
    owner: joi.string().required(),
    valuation: joi.bigNumber().required(),
    value: joi.bigNumber().required(),
    expiresAfter: joi.bigNumber().required().greaterThanOrEqualTo(30)
}).required()

export class CreateWarranty extends Component {
    constructor(props) {
        super(props)
        this.onCreate = this.onCreate.bind(this)
    }
    toastProvider = null
    async onCreate(inputs) {
        const { value, valuation, owner, expiresAfter } = inputs
        const { contract, web3 } = this.props
        const { toWei } = web3.utils
        const { givenProvider, methods } = contract
        const receipt = await methods.createAndGuaranteeClaim(owner, toWei(valuation, 'ether'), expiresAfter).send({
            from: givenProvider.selectedAddress,
            value: toWei(value, 'ether')
        })
        if (!this.toastProvider) {
            return
        }
        this.toastProvider.addMessage("Processing warranty creation...", {
            // secondaryMessage: "Check progress on Etherscan",
            // actionHref:
            //     "https://etherscan.io/tx/0xcbc921418c360b03b96585ae16f906cbd48c8d6c2cc7b82c6db430390a9fcfed",
            // actionText: "Check",
            variant: "processing"
        })
        this.setState({
            receipt
        })
    }
    render() {
        return (
            <Card px={2} py={3} mt={3}>
                <ToastMessage.Provider ref={node => (this.toastProvider = node)} />
                <Form validation={createSchema} onSubmit={this.onCreate}>
                    <Flex mx={2} flexWrap={"wrap"}>
                        <h3>Create a new warranty</h3>
                    </Flex>
                    <Consumer>
                        {({ onChange, valid, inputs }) => (
                            <>
                                <Flex flexWrap={"wrap"}>
                                    <Box width={[1, 1, 1 / 2]}>
                                        <Field label="Warranty Owner" width={1} px={2}>
                                            <Input
                                                type="text"
                                                width={1}
                                                required={true}
                                                value={inputs.owner || ''}
                                                placeholder="e.g. 0xAc03BB73b6a9e108530AFf4Df5077c2B3D481e5A"
                                                onChange={(e) => onChange("owner", e)} />
                                        </Field>
                                    </Box>
                                </Flex>
                                <Flex flexWrap="wrap">
                                    <Box width={[1, 1, 1 / 2]}>
                                        <Field label="Valuation" width={1} px={2}>
                                            <Input
                                                type="text"
                                                width={1}
                                                required={true}
                                                value={inputs.valuation || ''}
                                                placeholder="assessed value in terms of ether (e.g. 25)"
                                                onChange={(e) => onChange("valuation", e)} />
                                        </Field>
                                    </Box>
                                    <Box width={[1, 1, 1 / 2]}>
                                        <Field label="Value" width={1} px={2}>
                                            <Input
                                                type="text"
                                                width={1}
                                                required={true}
                                                value={inputs.value || ''}
                                                placeholder="Starting value in ether (e.g. 1.2)"
                                                onChange={(e) => onChange("value", e)} />
                                        </Field>
                                    </Box>
                                    <Box width={[1, 1, 1 / 2]}>
                                        <Field label="Expires After" width={1} px={2}>
                                            <Input
                                                type="text"
                                                width={1}
                                                required={true}
                                                value={inputs.expiresAfter || ''}
                                                placeholder="time until warranty expires in seconds"
                                                onChange={(e) => onChange("expiresAfter", e)} />
                                        </Field>
                                    </Box>
                                </Flex>
                                <Flex flexWrap={"wrap"} px={2}>
                                    <Box width={[1, 1, 1 / 2]}>
                                        <Button type="submit" disabled={!valid}>Create Warranty</Button>
                                    </Box>
                                </Flex>
                            </>
                        )}
                    </Consumer>
                </Form>
            </Card >
        )
    }
}

class Form extends Component {
    state = {
        inputs: {}
    }
    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }
    validate() {
        return this.props.validation.validate(this.state.inputs)
    }
    isValid() {
        const result = this.validate()
        return !result.error
    }
    async onSubmit(e) {
        e.preventDefault()
        e.stopPropagation()
        await this.props.onSubmit(this.state.inputs)
        this.setState({
            inputs: {}
        })
    }
    onChange(key, e) {
        this.setState({
            inputs: Object.assign({}, this.state.inputs, {
                [key]: e.target.value
            })
        })
    }
    render() {
        const valid = this.isValid()
        return (
            <RimbleForm onSubmit={this.onSubmit} validated={valid}>
                <Provider value={{
                    valid,
                    onChange: this.onChange,
                    inputs: this.state.inputs
                }}>{this.props.children}</Provider>
            </RimbleForm>
        )
    }
}

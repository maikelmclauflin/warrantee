import React from 'react'
import {
  Flex,
  Box,
  Field,
  Card,
  Input,
  Button,
  Loader as RimbleLoader
} from 'rimble-ui'
import { Helmet } from 'react-helmet'
import {
  Form,
  FormContext
} from 'components/Form'
import { fund as fundSchema } from 'schemas'
import { Web3Context } from 'contexts/Web3'
import { ignoreReject } from 'utils'
import { Processor } from 'components/Processor'
import { deleteClaim } from 'model/Claim'

export class GuaranteeWarranty extends Processor {
  processorMethod = 'fund'
  toastConfig = {
    processing: () => ({ message: 'Claiming Warrantor Status...' }),
    success: () => ({ message: 'Warrantor Status Granted' }),
    failure: (error) => ({
      message: 'Unable to Claim Warrantor Status',
      options: {
        variant: 'failure',
        secondaryMessage: error.toString(),
      }
    }),
  }
  onSubmit(inputs) {
    return this.process(inputs)
  }
  async fund(inputs) {
    const { context } = this
    const { contract, web3 } = context
    const { toWei } = web3.utils
    const { selectedAddress } = web3.givenProvider
    const { methods } = contract
    const { id, value } = inputs
    return ignoreReject(async () => {
      deleteClaim(id) // from cache
      await methods.guaranteeClaim(id).send({
        from: selectedAddress,
        value: toWei(value, 'ether'),
      })
      return true
    })
  }
  render() {
    const { processing, error } = this.state
    return (
      <Card p={3} mt={3}>
        {this.toastMessage()}
        <Helmet>
          <title>Guarantee Claim</title>
        </Helmet>
        <Form onSubmit={this.onSubmit.bind(this)}
          validation={fundSchema}
          defaultInputs={{
            value: '0',
          }}>
          <Flex mx={3} flexWrap="wrap">
            <h3>Guarantee a Claim</h3>
          </Flex>
          <FormContext.Consumer>{({ onChange, inputs, valid, validateds }) => (console.log(validateds) ||
            <Flex mt={3} flexWrap="wrap">
              <Box width={[1, 1, 1 / 2]} px={3}>
                <Field label="ID to guarantee" width={1} validated={validateds.id}>
                  <Input
                    width={1}
                    type="number"
                    required={true}
                    value={inputs.id || ''}
                    onChange={(e) => onChange('id', e)} />
                </Field>
              </Box>
              <Box width={[1, 1, 1 / 2]} px={3}>
                <Field label="Value to add in ether" width={1} validated={validateds.value}>
                  <Input
                    width={1}
                    type="number"
                    required={true}
                    value={inputs.value || ''}
                    onChange={(e) => onChange('value', e)} />
                </Field>
              </Box>
              <Box width={[1, 1, 1 / 2]} px={3} my={3}>
                <Button
                  type="submit"
                  disabled={processing || !valid}>
                  Guarantee Claim&nbsp;{processing ? <RimbleLoader color="white" /> : []}
                </Button>
              </Box>
              {error ? <Box width={1} px={3} my={3}>
                <pre>{error.toString()}</pre>
              </Box> : []}
            </Flex>
          )}</FormContext.Consumer>
        </Form>
      </Card>
    )
  }
}

GuaranteeWarranty.contextType = Web3Context

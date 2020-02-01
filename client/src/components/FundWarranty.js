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

export class FundWarranty extends Processor {
  processorMethod = 'fund'
  toastConfig = {
    processing: () => ({ message: 'Funding Claim...' }),
    success: () => ({ message: 'Claim Funded' }),
    failure: (error) => ({
      message: 'Unable to Fund Claim',
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
    const { id, value, back } = inputs
    return ignoreReject(async () => {
      deleteClaim(id) // from cache
      await methods.fundClaim(id, back).send({
        from: selectedAddress,
        value: toWei(value, 'ether'),
      })
      return true
    })
  }
  render() {
    const { props, state, onSubmit } = this
    const { match = {} } = props
    const { params = {} } = match
    const { id } = params
    const { processing, error } = state
    return (
      <Card p={3} mt={3}>
        {this.toastMessage()}
        <Helmet>
          <title>Fund Claim</title>
        </Helmet>
        <Form onSubmit={onSubmit.bind(this)}
          validation={fundSchema}
          defaultInputs={{
            id,
            value: '0',
          }}>
          <Flex mx={3} flexWrap='wrap'>
            <h3>Fund a Claim</h3>
          </Flex>
          <FormContext.Consumer>{({ onChange, inputs, valid, validateds }) => (
            <Flex mt={3} flexWrap='wrap'>
              <Box width={[1, 1, 1 / 2]} px={3}>
                <Field label='ID to guarantee' width={1} validated={validateds.id}>
                  <Input
                    width={1}
                    type='number'
                    required={true}
                    disabled={!!id}
                    value={inputs.id || ''}
                    onChange={(e) => onChange('id', e)} />
                </Field>
              </Box>
              <Box width={[1, 1, 1 / 2]} px={3}>
                <Field label="Amount to back the claim with" width={1} validated={validateds.back}>
                  <Input
                    width={1}
                    type="number"
                    required={true}
                    value={inputs.back || ''}
                    onChange={(e) => onChange('back', e)} />
                </Field>
              </Box>
              <Box width={[1, 1, 1 / 2]} px={3}>
                <Field label='Value to add in ether' width={1} validated={validateds.value}>
                  <Input
                    width={1}
                    type='number'
                    required={true}
                    value={inputs.value || ''}
                    onChange={(e) => onChange('value', e)} />
                </Field>
              </Box>
              <Box width={[1, 1, 1 / 2]} px={3} my={3}>
                <Button
                  type='submit'
                  disabled={processing || !valid}>
                  Fund Claim&nbsp;{processing ? <RimbleLoader color='white' /> : []}
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

FundWarranty.contextType = Web3Context

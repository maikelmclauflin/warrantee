import React from 'react'
import {
  Input,
  Button,
  Loader as RimbleLoader,
  Flex,
  Box,
  Card,
  Field
} from 'rimble-ui'
import { Processor } from 'components/Processor'
import { Form, FormContext } from 'components/Form'
import { Web3Context } from 'contexts/Web3'
import { create as createSchema } from 'schemas'
import { ignoreReject } from 'utils'

export class CreateWarranty extends Processor {
  processorMethod = 'create'
  onSubmit(inputs) {
    return this.process(inputs)
  }
  async create(inputs) {
    const { props, context } = this
    const { guarantee } = props
    const { value, valuation, owner, expiresAfter } = inputs
    const { contract, web3 } = context
    const { toWei } = web3.utils
    const { givenProvider, methods } = contract
    const method = guarantee ? 'createAndGuaranteeClaim' : 'createClaim'
    await ignoreReject(async () =>
      await methods[method](owner, toWei(valuation, 'ether'), expiresAfter).send({
        from: givenProvider.selectedAddress,
        value: toWei(value, 'ether')
      })
    )
  }
  render() {
    const { state, props, context } = this
    const { processing } = state
    const { contract } = context
    const { givenProvider } = contract
    const owner = props.guarantee ? '' : givenProvider.selectedAddress
    return (
      <Card px={3} py={3} mt={3}>
        {this.toastMessage({
          message: 'Processing warranty creation...',
          options: {
            variant: 'processing'
          }
        })}
        <Form validation={createSchema} onSubmit={this.onSubmit.bind(this)} defaultInputs={{
          owner,
        }}>
          <FormContext.Consumer>{({ inputs, onChange, valid }) => (
            <>
              <Flex mx={3} flexWrap='wrap'>
                <h3>Create a New Claim</h3>
              </Flex>
              <Flex mt={3} flexWrap='wrap'>
                <Box width={[1, 1, 1 / 2]}>
                  <Field label='Warranty Owner' width={1} px={3}>
                    <Input
                      type='text'
                      width={1}
                      required={true}
                      disabled={!!owner}
                      value={owner || inputs.owner || ''}
                      placeholder='e.g. 0xAc03BB73b6a9e108530AFf4Df5077c2B3D481e5A'
                      onChange={(e) => onChange('owner', e)} />
                  </Field>
                </Box>
              </Flex>
              <Flex flexWrap='wrap'>
                <Box width={[1, 1, 1 / 2]}>
                  <Field label='Valuation' width={1} px={3}>
                    <Input
                      type='text'
                      width={1}
                      required={true}
                      value={inputs.valuation || ''}
                      placeholder='assessed value in terms of ether (e.g. 25)'
                      onChange={(e) => onChange('valuation', e)} />
                  </Field>
                </Box>
                <Box width={[1, 1, 1 / 2]}>
                  <Field label='Value' width={1} px={3}>
                    <Input
                      type='text'
                      width={1}
                      required={true}
                      value={inputs.value || ''}
                      placeholder='Starting value in ether (e.g. 1.2)'
                      onChange={(e) => onChange('value', e)} />
                  </Field>
                </Box>
                <Box width={[1, 1, 1 / 2]}>
                  <Field label='Expires After' width={1} px={3}>
                    <Input
                      type='text'
                      width={1}
                      required={true}
                      value={inputs.expiresAfter || ''}
                      placeholder='time until warranty expires in seconds'
                      onChange={(e) => onChange('expiresAfter', e)} />
                  </Field>
                </Box>
              </Flex>
              <Flex flexWrap='wrap' px={3} my={3}>
                <Box width={[1, 1, 1 / 2]}>
                  <Button
                    type='submit'
                    disabled={processing || !valid}>Create Warranty&nbsp;{processing ? <RimbleLoader color='white' /> : []}
                  </Button>
                </Box>
              </Flex>
            </>
          )}</FormContext.Consumer>
        </Form>
      </Card >
    )
  }
}

CreateWarranty.contextType = Web3Context

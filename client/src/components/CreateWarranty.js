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
import { Helmet } from 'react-helmet'
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
  toastConfig = {
    processing: () => ({ message: 'Processing Claim Creation...' }),
    success: () => ({ message: 'Claim Created' }),
    failure: (error) => ({
      message: 'Unable to Create Claim',
      options: {
        variant: 'failure',
        secondaryMessage: error.toString(),
      }
    }),
  }
  async create(inputs) {
    const { context, props } = this
    const { value, valuation, warrantee, warrantor, expiresAfter } = inputs
    const { contract, web3 } = context
    const { toWei } = web3.utils
    const { givenProvider, methods } = contract
    const from = givenProvider.selectedAddress
    const valueWei = toWei(value, 'ether')
    const valuationWei = toWei(valuation, 'ether')
    const options = {
      from,
      value: valueWei,
    }
    console.log({
      from,
      warrantee,
      warrantor,
      valuationWei,
      valueWei,
      expiresAfter
    })
    return ignoreReject(async () => {
      console.log('props.guarantee', props.guarantee)
      if (props.guarantee) {
        const result = await methods.createAndGuaranteeClaim(warrantee, valuationWei, expiresAfter).send(options)
        console.log(result)
      } else {
        const result = await methods.createClaim(warrantee, warrantor, valuationWei, expiresAfter).send(options)
        console.log(result)
      }
      return true
    })
  }
  render() {
    const { state, props, context, onSubmit } = this
    const { processing } = state
    const { contract } = context
    const { givenProvider } = contract
    let warrantee = ''
    let warrantor = ''
    let disableWarrantor = false
    if (props.guarantee) {
      warrantor = givenProvider.selectedAddress
      disableWarrantor = true
    } else {
      warrantee = givenProvider.selectedAddress
    }
    return (
      <Card px={3} py={3} mt={3}>
        {this.toastMessage()}
        <Helmet>
          <title>Create Claim</title>
        </Helmet>
        <Form validation={createSchema} onSubmit={onSubmit.bind(this)} defaultInputs={{
          warrantee,
          warrantor,
        }}>
          <FormContext.Consumer>{({ inputs, onChange, valid }) => (
            <>
              <Flex mx={3} flexWrap='wrap'>
                <h3>Create a New Claim</h3>
              </Flex>
              <Flex mt={3} flexWrap='wrap' title='The warrantee of the token when it is minted'>
                <Box width={[1, 1, 1 / 2]}>
                  <Field label='Warrantee' width={1} px={3}>
                    <Input
                      type='text'
                      width={1}
                      required={true}
                      value={inputs.warrantee || ''}
                      placeholder='e.g. 0xAc03BB73b6a9e108530AFf4Df5077c2B3D481e5A'
                      onChange={(e) => onChange('warrantee', e)} />
                  </Field>
                </Box>
                <Box width={[1, 1, 1 / 2]}>
                  <Field label='Warrantor' width={1} px={3}>
                    <Input
                      type='text'
                      width={1}
                      required={true}
                      disabled={disableWarrantor}
                      value={inputs.warrantor || ''}
                      placeholder='e.g. 0xAc03BB73b6a9e108530AFf4Df5077c2B3D481e5A'
                      onChange={(e) => onChange('warrantor', e)} />
                  </Field>
                </Box>
              </Flex>
              <Flex flexWrap='wrap' title='The valuation of the item to be fulfilled in ETH if the claim is redeemed and fulfilled by the warrantor'>
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
                <Box width={[1, 1, 1 / 2]} title='The value to be attributed into the token when it is minted'>
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
                <Box width={[1, 1, 1 / 2]} title='The point in time when the token can be liquidated'>
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

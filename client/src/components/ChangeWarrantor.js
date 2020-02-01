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
import { changewarrantor as changewarrantorSchema } from 'schemas'
import { ClaimContext } from 'contexts/Claim'
import { ignoreReject } from 'utils'
import { Processor } from 'components/Processor'
import { deleteClaim } from 'model/Claim'

export class ChangeWarrantor extends Processor {
  processorMethod = 'changewarrantor'
  toastConfig = {
    processing: () => ({ message: 'Changing Warrantor...' }),
    success: () => ({ message: 'Warrantor Updated' }),
    failure: (error) => ({
      message: 'Unable to Change Warrantor',
      options: {
        variant: 'failure',
        secondaryMessage: error.toString(),
      }
    }),
  }
  onSubmit(inputs) {
    return this.process(inputs)
  }
  async changewarrantor(inputs) {
    const { context } = this
    const { contract, web3 } = context
    const { selectedAddress } = web3.givenProvider
    const { methods } = contract
    const { id, warrantor } = inputs
    return ignoreReject(async () => {
      deleteClaim(id) // from cache
      await methods.transferWarrantorship(id, warrantor).send({
        from: selectedAddress,
      })
      return true
    })
  }
  render() {
    const { context, state, onSubmit } = this
    const { claim } = context
    const { processing, error } = state
    return (
      <Card p={3} mt={3}>
        {this.toastMessage()}
        <Helmet>
          <title>Update Claim Warrantor</title>
        </Helmet>
        <Form onSubmit={onSubmit.bind(this)}
          validation={changewarrantorSchema}
          defaultInputs={{
            id: claim.id,
            warrantor: claim.warrantor,
          }}>
          <Flex mx={3} flexWrap='wrap'>
            <h3>Update Claim Warrantor</h3>
          </Flex>
          <FormContext.Consumer>{({ onChange, inputs, valid, validateds }) => (
            <Flex mt={3} flexWrap='wrap'>
              <Box width={[1, 1, 1 / 2]} px={3}>
                <Field label='ID to guarantee' width={1} validated={validateds.id}>
                  <Input
                    width={1}
                    type='number'
                    disabled={true}
                    value={inputs.id || ''}
                    onChange={(e) => onChange('id', e)} />
                </Field>
              </Box>
              <Box width={[1, 1, 1 / 2]} px={3}>
                <Field label="Warrantor to set on the claim" width={1} validated={validateds.warrantor}>
                  <Input
                    width={1}
                    type="text"
                    required={true}
                    value={inputs.warrantor || ''}
                    onChange={(e) => onChange('warrantor', e)} />
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

ChangeWarrantor.contextType = ClaimContext

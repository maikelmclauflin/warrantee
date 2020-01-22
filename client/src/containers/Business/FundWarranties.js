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
import {
  Form,
  FormContext
} from 'components/Form'
import { fund as fundSchema } from 'schemas'
import { Web3Context } from 'contexts/Web3'
import { ignoreReject } from 'utils'
import { Processor } from 'components/Processor'
import { deleteClaim } from 'model/Claim'

export class FundWarranties extends Processor {
  processorMethod = 'fund'
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
    console.log(value)
    await ignoreReject(async () => {
      deleteClaim(id)
      await methods.guaranteeClaim(id).send({
        from: selectedAddress,
        value: toWei(value, 'ether'),
      })
    })
  }
  render() {
    const { processing, error } = this.state
    return (
      <Card p={3} mt={3}>
        {this.toastMessage({
          message: "Claiming warrantor status...",
          options: {
            variant: "processing"
          }
        })}
        <Form onSubmit={this.onSubmit.bind(this)}
          validation={fundSchema}
          defaultInputs={{
            value: '0',
          }}>
          <Flex mx={3} flexWrap="wrap">
            <h3>Fund a Claim</h3>
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
                  Fund Claim&nbsp;{processing ? <RimbleLoader color="white" /> : []}
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

FundWarranties.contextType = Web3Context

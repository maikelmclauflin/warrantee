import React, { useContext } from "react";
import {
  Card,
  Box,
  Field,
  Input,
  Button,
  Loader as RimbleLoader,
  Flex
} from 'rimble-ui'
import { Form, FormContext } from 'components/Form'
import { Processor } from 'components/Processor'
import { UserContext } from 'contexts/User'
import { Web3Context } from 'contexts/Web3'
import { ignoreReject } from "utils";
export class User extends Processor {
  processorMethod = 'releaseFunds'
  async releaseFunds({ web3, contract, selectedAddress, inputs, }) {
    await ignoreReject(async () => {
      await contract.methods.releaseTo(inputs.address, web3.utils.toWei(inputs.amount, 'ether')).send({
        from: selectedAddress,
      })
    })
  }
  render() {
    return (
      <Web3Context.Consumer>{({ web3, contract }) => (
        <UserContext.Consumer>{({ amount, selectedAddress }) => (
          <Card>
            <Form defaultInputs={{
              address: selectedAddress,
              amount: web3.utils.fromWei(amount.toString(), 'ether'),
            }} onSubmit={async (inputs) => {
              this.process({ web3, contract, selectedAddress, inputs, })
            }}>
              <Release processing={this.state.processing} />
            </Form>
          </Card>
        )}</UserContext.Consumer>
      )}</Web3Context.Consumer>
    )
  }
}

function Release({ processing }) {
  const { inputs, onChange, valid, } = useContext(FormContext)
  return (
    <Flex flexWrap="wrap" mx={-3}>
      <Box
        width={[1, 1, 1 / 2]}
        px={3}>
        <Field
          label="Address to release ether to"
          width={1}>
          <Input
            type="text"
            width={1}
            value={inputs.address || ''}
            onChange={(e) => onChange('address', e)}
            required={true} />
        </Field>
      </Box>
      <Box
        width={[1, 1, 1 / 2]}
        px={3}>
        <Field
          label="Available ether to release from the contract"
          width={1}>
          <Input
            type="number"
            width={1}
            value={inputs.amount || ''}
            onChange={(e) => onChange('amount', e)}
            required={true} />
        </Field>
      </Box>
      <Box width={[1, 1, 1 / 2]} px={3}>
        <Button
          type="submit"
          disabled={(processing || !valid) && (+inputs.amount <= 0)}>Release Ether&nbsp;{processing ? <RimbleLoader color="white" /> : []}
        </Button>
      </Box>
    </Flex>
  )
}
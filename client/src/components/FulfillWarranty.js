import React from 'react'
import BigNumber from 'bignumber.js'
import { Processor } from 'components/Processor'
import { Text } from 'components/Text'
import { Form, FormContext } from 'components/Form'
import { ignoreReject, addressZero } from 'utils'
import {
  Button,
  Flex,
  Field,
  Input,
  Box,
  Loader as RimbleLoader,
  Text as RimbleText
} from 'rimble-ui'
import { ViewClaimMetadata } from 'components/ViewClaimMetadata'
import { ClaimContext } from 'contexts/Claim'
import { fulfill as fulfillSchema } from 'schemas/'
export class FulfillWarranty extends Processor {
  processorMethod = 'fulfill'
  onSubmit(inputs) {
    return this.process(inputs)
  }
  async fulfill(inputs) {
    const { context } = this
    const { contract, claim, web3 } = context
    const { toWei } = web3.utils
    const { methods, givenProvider } = contract
    return ignoreReject(async () => {
      await methods.fulfillClaim(inputs.address || addressZero, claim.id).send({
        from: givenProvider.selectedAddress,
        // excess eth is credited to sender
        value: toWei(inputs.value, 'ether'),
      })
      await context.updateClaim()
      return true
    })
  }
  computeNeededValue() {
    const { web3, claim } = this.context
    const { fromWei } = web3.utils
    return fromWei((new BigNumber(claim.valuation)).minus(claim.value).toString(), 'ether')
  }
  render() {
    const { state, context } = this
    const { claim } = context
    const { error, processing } = state
    return (
      <Box my={3}>
        <Form
          validation={fulfillSchema}
          onSubmit={this.onSubmit.bind(this)}
          defaultInputs={{ value: this.computeNeededValue(), address: '' }}>
          <FormContext.Consumer>{(form) => (
            <>
              <Text title="Action">Fulfillment</Text>
              <ViewClaimMetadata claim={claim} />
              <Flex mt={3} mx={-3}>
                <Box width={[1, 1, 1 / 2]}>
                  <Field label="Required token owner" width={1} px={3}>
                    <Input
                      width={1}
                      type="text"
                      value={form.inputs.address || ''}
                      placeholder={`default: ${addressZero}`}
                      onChange={(e) => form.onChange("address", e)} />
                  </Field>
                </Box>
                <Box width={[1, 1, 1 / 2]}>
                  <Field label="Value Needed to Fulfill (ether)" width={1} px={3}>
                    <Input
                      width={1}
                      type="number"
                      value={form.inputs.value || ''}
                      required={true}
                      placeholder="e.g. 100000000000"
                      onChange={(e) => form.onChange("value", e)} />
                  </Field>
                </Box>
              </Flex>
              <Button
                type="submit"
                mt={3}
                disabled={processing || !claim.can('fulfill')}>
                Fulfill Warranty&nbsp;{processing ? <RimbleLoader color="white" /> : []}
              </Button>
              <RimbleText>{error ? error.toString() : []}</RimbleText>
              {/* {(processed && !error) ? <Redirect to=".." /> : []} */}
            </>
          )}
          </FormContext.Consumer>
        </Form>
      </Box>
    )
  }
}

FulfillWarranty.contextType = ClaimContext

import React from 'react'
import { Processor } from 'components/Processor'
import { Text } from 'components/Text'
import { ignoreReject } from 'utils'
import { ViewClaimMetadata } from 'components/ViewClaimMetadata'
import { Form, FormContext } from 'components/Form'
import {
  Flex,
  Button,
  Box,
  Field,
  Input,
  Loader as RimbleLoader,
  Text as RimbleText
} from 'rimble-ui'
import { ClaimContext } from 'contexts/Claim'
import { deredeem as deredeemSchema } from 'schemas/'
export class DeredeemWarranty extends Processor {
  processorMethod = 'deredeem'
  onSubmit(inputs) {
    return this.process(inputs)
  }
  async deredeem(inputs) {
    const { context } = this
    const { contract } = context
    const { methods, givenProvider } = contract
    return ignoreReject(async () => {
      await methods.deredeemClaim(context.claim.id, inputs.expiryTime, inputs.delayTime).send({
        from: givenProvider.selectedAddress
      })
      await context.updateClaim()
      return true
    })
  }
  render() {
    const { state, context } = this
    const { claim } = context
    const { error, processing } = state
    return (
      <Box mt={3}>
        <Text title="Action">De-Redemption</Text>
        <ViewClaimMetadata claim={claim} />
        <Form validation={deredeemSchema} onSubmit={this.onSubmit.bind(this)} defaultInputs={{
          delayTime: '0',
          expiryTime: '0',
        }}>
          <FormContext.Consumer>{({ inputs, onChange }) => (
            <Flex mt={3} mx={-3} flexWrap='wrap'>
              <Box width={[1, 1, 1 / 2]}>
                <Field label="Delay Time (b)" width={1} px={3}>
                  <Input
                    width={1}
                    type="number"
                    value={inputs.delayTime || ''}
                    required={true}
                    placeholder="Add seconds to the delay time"
                    onChange={(e) => onChange("delayTime", e)} />
                </Field>
              </Box>
              <Box width={[1, 1, 1 / 2]}>
                <Field label="Expiry Time (c)" width={1} px={3}>
                  <Input
                    width={1}
                    type="number"
                    value={inputs.expiryTime || ''}
                    required={true}
                    placeholder="Add seconds to the expiry time"
                    onChange={(e) => onChange("expiryTime", e)} />
                </Field>
              </Box>
              <Box width={1} px={3}>
                <Button
                  type="submit"
                  mt={3}
                  // onClick={this.onClick.bind(this)}
                  disabled={processing || !claim.can('deredeem')}>
                  Deredeem Warranty&nbsp;{processing ? <RimbleLoader color="white" /> : []}
                </Button>
              </Box>
              <Box width={1}>
                <RimbleText>{error ? error.toString() : []}</RimbleText>
              </Box>
            </Flex>
          )}
          </FormContext.Consumer>
        </Form>
        {/* {(processed && !error) ? <Redirect to=".." /> : []} */}
      </Box >
    )
  }
}

DeredeemWarranty.contextType = ClaimContext

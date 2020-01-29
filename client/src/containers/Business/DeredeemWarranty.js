import React from 'react'
import { Processor } from 'components/Processor'
import { Text } from 'components/Text'
import { ignoreReject, toDate } from 'utils'
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
// import { Redirect } from 'react-router-dom'
import { Progress } from 'components/Progress'
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
    const { props, state, context } = this
    const { match } = props
    const { claim } = context
    const { id } = match.params
    const { error, processing } = state
    return (
      <Box mt={3}>
        <Text title="Action">Redemption</Text>
        <Text title="ID">{id}</Text>
        <Text title="Owner">{claim.owner}</Text>
        <Text title="Activated At">{toDate(claim.activatedTime())}</Text>
        <Text title="Expires At">{toDate(claim.expiredTime())}</Text>
        <Text title="Progress"><Progress claim={claim} /></Text>
        <Form validation={deredeemSchema} onSubmit={this.onSubmit.bind(this)}>
          <FormContext.Consumer>{(form) => (
            <Flex mt={3} mx={-3}>
              <Box width={[1, 1, 1 / 2]}>
                <Field label="Delay Time (b)" width={1} px={3}>
                  <Input
                    width={1}
                    type="number"
                    value={form.inputs.delayTime || ''}
                    required={true}
                    placeholder="Add seconds to the delay time"
                    onChange={(e) => form.onChange("delayTime", e)} />
                </Field>
              </Box>
              <Box width={[1, 1, 1 / 2]}>
                <Field label="Expiry Time (c)" width={1} px={3}>
                  <Input
                    width={1}
                    type="number"
                    value={form.inputs.expiryTime || ''}
                    required={true}
                    placeholder="Add seconds to the expiry time"
                    onChange={(e) => form.onChange("expiryTime", e)} />
                </Field>
              </Box>
              <Box width={1}>
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
      </Box>
    )
  }
}

DeredeemWarranty.contextType = ClaimContext

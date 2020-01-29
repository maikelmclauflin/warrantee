import React from 'react'
import { Processor } from 'components/Processor'
import { Text } from 'components/Text'
import { ignoreReject, toDate } from 'utils'
import {
  Button,
  Box,
  Loader as RimbleLoader,
  Text as RimbleText
} from 'rimble-ui'
// import { Redirect } from 'react-router-dom'
import { Progress } from 'components/Progress'
import { ClaimContext } from 'contexts/Claim'
export class TerminateWarranty extends Processor {
  processorMethod = 'terminate'
  onClick(e) {
    return this.process() // process calls terminate
  }
  async terminate() {
    const { context } = this
    const { contract } = context
    const { methods, givenProvider } = contract
    return ignoreReject(async () => {
      await methods.terminateClaim(context.claim.id).send({
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
      <Box my={3}>
        <Text title="Action">Termination</Text>
        <Text title="ID">{id}</Text>
        <Text title="Owner">{claim.owner}</Text>
        <Text title="Activated At">{toDate(claim.activatedTime())}</Text>
        <Text title="Expires At">{toDate(claim.expiredTime())}</Text>
        <Text title="Progress"><Progress claim={claim} /></Text>
        <Button
          mt={3}
          onClick={this.onClick.bind(this)}
          disabled={processing || !claim.can('terminate')}>
          Terminate Warranty&nbsp;{processing ? <RimbleLoader color="white" /> : []}
        </Button>
        <RimbleText>{error ? error.toString() : []}</RimbleText>
        {/* {(processed && !error) ? <Redirect to=".." /> : []} */}
      </Box>
    )
  }
}

TerminateWarranty.contextType = ClaimContext

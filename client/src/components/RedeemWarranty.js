import React from 'react'
import { Processor } from 'components/Processor'
import { Text } from 'components/Text'
import { ignoreReject } from 'utils'
import {
  Button,
  Box,
  Loader as RimbleLoader,
  Text as RimbleText
} from 'rimble-ui'
import { ViewClaimMetadata } from 'components/ViewClaimMetadata'
// import { Redirect } from 'react-router-dom'
import { ClaimContext } from 'contexts/Claim'
export class RedeemWarranty extends Processor {
  processorMethod = 'redeem'
  onClick() {
    return this.process()
  }
  async redeem() {
    const { context } = this
    const { contract } = context
    const { methods, givenProvider } = contract
    return ignoreReject(async () => {
      await methods.redeemClaim(context.claim.id).send({
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
      <Box my={3}>
        <Text title="Action">Redemption</Text>
        <ViewClaimMetadata claim={claim} />
        <Button
          mt={3}
          onClick={this.onClick.bind(this)}
          disabled={processing || !claim.can('redeem')}>
          Redeem Warranty&nbsp;{processing ? <RimbleLoader color="white" /> : []}
        </Button>
        <RimbleText>{error ? error.toString() : []}</RimbleText>
        {/* {(processed && !error) ? <Redirect to=".." /> : []} */}
      </Box>
    )
  }
}

RedeemWarranty.contextType = ClaimContext

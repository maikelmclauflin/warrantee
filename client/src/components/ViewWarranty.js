import React from "react"
import { Web3Context } from 'contexts/Web3'
import {
  Button,
  Box
} from 'rimble-ui'
import { Link } from 'components/Link'
import { ViewClaimMetadata } from 'components/ViewClaimMetadata'
import { LoadsWarranty } from "./LoadsWarranty"

export class ViewWarranty extends LoadsWarranty {
  renderLoaded() {
    const { state, props } = this
    const { match } = props
    const { url } = match
    const { claim } = state
    const business = match.path.indexOf('/business') === 0
    const { selectedAddress } = this.context.web3.givenProvider
    const iAmWarrantee = selectedAddress === claim.warrantee.toLowerCase()
    const iAmWarrantor = selectedAddress === claim.warrantor.toLowerCase()
    let actions = []

    const terminate = (<Box mr={3} mt={3} width="auto" display="inline-block">
      <Link to={`${url}terminate/`}>
        <Button disabled={!claim.can('terminate')}>Terminate</Button>
      </Link>
    </Box>)
    const fund = (<Box mr={3} mt={3} width="auto" display="inline-block">
      <Link to={`${url}fund/`}>
        <Button.Outline disabled={!claim.can('fund')}>Fund</Button.Outline>
      </Link>
    </Box>)
    const redeem = (<Box mr={3} mt={3} width="auto" display="inline-block">
      <Link to={`${url}redeem/`}>
        <Button.Outline disabled={!claim.can('redeem')}>Redeem</Button.Outline>
      </Link>
    </Box>)
    const deredeem = (<Box mr={3} mt={3} width="auto" display="inline-block">
      <Link to={`${url}deredeem/`}>
        <Button.Outline disabled={!claim.can('deredeem')}>Deredeem</Button.Outline>
      </Link>
    </Box>)
    const fulfill = (<Box mr={3} mt={3} width="auto" display="inline-block">
      <Link to={`${url}fulfill/`}>
        <Button disabled={!claim.can('fulfill')}>Fulfill</Button>
      </Link>
    </Box>)
    const transfer = (<Box mr={3} mt={3} width="auto" display="inline-block">
      <Link to={`${url}transfer/`}>
        <Button disabled={!claim.can('transfer')}>Transfer</Button>
      </Link>
    </Box>)
    if (business && iAmWarrantor) {
      actions = (
        <>
          {terminate}
          {fund}
          {deredeem}
          {fulfill}
          {transfer}
        </>
      )
    } else if (!business && iAmWarrantee) {
      actions = (
        <>
          {terminate}
          {fund}
          {redeem}
          {transfer}
        </>
      )
    }
    return (
      <Box my={3}>
        <ViewClaimMetadata claim={claim} />
        {actions}
      </Box>
    )
  }
}

ViewWarranty.contextType = Web3Context

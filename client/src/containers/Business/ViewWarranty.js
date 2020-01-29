import React from "react"
import { toDate } from '../../utils'
import { Web3Context } from 'contexts/Web3'
import {
  Button,
  Box
} from 'rimble-ui'
import { pathAppend } from 'utils'
import { Link } from 'components/Link'
import { Progress } from 'components/Progress'
import { Text } from 'components/Text'
import { LoadsWarranty } from "./LoadsWarranty"

export class ViewWarranty extends LoadsWarranty {
  renderLoaded() {
    const { state, props } = this
    const { match } = props
    const { url } = match
    const { claim } = state
    return (
      <Box my={3}>
        <Text title="Owner">{claim.owner}</Text>
        <Text title="ID">{claim.id}</Text>
        <Text title="Activated At">{toDate(claim.activatedTime())}</Text>
        <Text title="Expires At">{toDate(claim.expiredTime())}</Text>
        <Text title="Progress"><Progress claim={claim} /></Text>
        <Box mr={3} my={3} width="auto" display="inline-block">
          <Link to={pathAppend(url, 'terminate/')}>
            <Button disabled={!claim.can('terminate')}>Terminate</Button>
          </Link>
        </Box>
        <Box mr={3} my={3} width="auto" display="inline-block">
          <Link to={pathAppend(url, `../../fund/${claim.id}/`)}>
            <Button.Outline disabled={!claim.can('fund')}>Fund</Button.Outline>
          </Link>
        </Box>
        <Box mr={3} my={3} width="auto" display="inline-block">
          <Link to={pathAppend(url, 'redeem/')}>
            <Button.Outline disabled={!claim.can('redeem')}>Redeem</Button.Outline>
          </Link>
        </Box>
        <Box mr={3} my={3} width="auto" display="inline-block">
          <Link to={pathAppend(url, 'deredeem/')}>
            <Button.Outline disabled={!claim.can('deredeem')}>Deredeem</Button.Outline>
          </Link>
        </Box>
        <Box mr={3} my={3} width="auto" display="inline-block">
          <Link to={pathAppend(url, 'fulfill/')}>
            <Button disabled={!claim.can('fulfill')}>Fulfill</Button>
          </Link>
        </Box>
      </Box>
    )
  }
}

ViewWarranty.contextType = Web3Context

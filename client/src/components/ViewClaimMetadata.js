import React from 'react'
import { toDate } from 'utils'
import { Text } from 'components/Text'
import { Progress } from 'components/Progress'

export const ViewClaimMetadata = ({ claim }) => {
  const { fromWei } = claim.web3.utils
  return (
    <>
      <Text title="Warrantee">{claim.warrantee}</Text>
      <Text title="Warrantor">{claim.warrantor}</Text>
      <Text title="ID">{claim.id}</Text>
      <Text title="Activated At">{toDate(claim.activatedTime())}</Text>
      <Text title="Expires At">{toDate(claim.expiredTime())}</Text>
      <Text title="Valuation">{fromWei(claim.valuation, 'ether')} ether</Text>
      <Text title="Value">{fromWei(claim.value, 'ether')} ether</Text>
      <Text title="Progress"><Progress claim={claim} /></Text>
    </>
  )
}

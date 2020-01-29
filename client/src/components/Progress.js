import React from 'react'
import ReactSentinel from 'react-sentinel'
import {
  Progress as RimbleProgress,
  Text
} from 'rimble-ui'
export const Progress = ({ claim }) => (
  claim.terminated ?
    (claim.fulfilled ?
      <Text.span>Fulfilled</Text.span> : (claim.redeemed ?
        <Text.span>Redeemed</Text.span> : <Text.span>Terminated</Text.span>))
    : <ReactSentinel initial={{
      value: claim.progress()
    }} observe={() => ({
      value: claim.progress()
    })} render={({ value }) => (
      <>
        <RimbleProgress value={value.toNumber()} />
        &nbsp;
        <Text.span fontFamily="courier">{value.isEqualTo(1) ? 'Complete' : (value.times(100).toFixed(4) + '%')}</Text.span>
      </>
    )} />
)

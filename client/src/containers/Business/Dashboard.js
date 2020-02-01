import React from 'react'
import _ from 'lodash'
import { ShowWarranties } from 'components/ShowWarranties'
import { Web3Context } from 'contexts/Web3'
import { Helmet } from 'react-helmet'

export class Dashboard extends ShowWarranties {
  acceptClaim(claim, claims) {
    const { givenProvider } = this.context.contract
    const { selectedAddress } = givenProvider
    const { warrantor, id } = claim
    return warrantor.toLowerCase() === selectedAddress.toLowerCase() && !_.find(claims, { id })
  }
  async getPastEvents() {
    const eventName = 'WarrantorshipChanged'
    const { contract } = this.context
    const { givenProvider } = contract
    const { selectedAddress } = givenProvider
    return {
      eventName,
      logs: await contract.getPastEvents(eventName, {
        filter: {
          to: selectedAddress,
        },
        fromBlock: this.cacheLogProgress(eventName) || 'earliest',
        toBlock: 'latest',
      })
    }
  }
  renderLoaded() {
    return (
      <>
        <Helmet>
          <title>Dashboard</title>
        </Helmet>
        {super.renderLoaded()}
      </>
    )
  }
}
Dashboard.contextType = Web3Context

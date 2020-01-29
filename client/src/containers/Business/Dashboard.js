import React from 'react'
import { ShowWarranties } from 'components/ShowWarranties'
import { Web3Context } from 'contexts/Web3'
import { Helmet } from 'react-helmet'

export class Dashboard extends ShowWarranties {
  acceptClaim(claim) {
    const { givenProvider } = this.context.contract
    return claim.warrantor.toLowerCase() === givenProvider.selectedAddress.toLowerCase()
  }
  async getPastEvents() {
    const eventName = 'Guaranteed'
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

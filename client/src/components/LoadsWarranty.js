import React, { Component } from 'react'
import { Claim } from 'model/Claim'
import { Loader } from 'components/Loader'
import { Box, Text } from 'rimble-ui'

export class LoadsWarranty extends Component {
  state = {
    error: null,
    claim: null,
  }
  componentDidMount() {
    return awaitFetch(this, this.createClaim().fetch())
  }
  createClaim() {
    const { props, context } = this
    const { match } = props
    const { contract, web3 } = context
    const { id } = match.params
    if (!contract) {
      return null
    }
    return new Claim(id, web3, contract)
  }
  updateClaim() {
    return awaitFetch(this, this.state.claim.update())
  }
  renderLoaded() {
    return []
  }
  render() {
    const { claim, error } = this.state
    if (error) {
      return (
        <Text>{error.toString()}</Text>
      )
    }
    if (!claim) {
      return (
        <Box my={3}>
          <Loader>Loading claim...</Loader>
        </Box>
      )
    }
    return this.renderLoaded()
  }
}

async function awaitFetch(component, promise) {
  try {
    const claim = await promise
    component.setState({
      claim,
      error: null,
    })
  } catch (error) {
    component.setState({
      error,
    })
  }
}

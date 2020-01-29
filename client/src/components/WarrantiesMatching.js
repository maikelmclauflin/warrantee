import React from 'react'
import { Processor } from 'components/Processor'
import { Loader } from 'components/Loader'
import { Claim } from 'model/Claim'
import { Web3Context } from 'contexts/Web3'
import _ from 'lodash'
import update from 'immutability-helper'

export const WarrantiesContext = React.createContext({})

export class WarrantiesMatching extends Processor {
  processorMethod = 'loadWarranties'
  state = {
    cache: {}
  }
  componentDidMount() {
    return this.process()
  }
  finishedAccepting(balanceOf, claims) {
    return +balanceOf === claims.length
  }
  acceptClaim(claim) {
    const { givenProvider } = this.context.contract
    return claim.warrantee.toLowerCase() === givenProvider.selectedAddress.toLowerCase()
  }
  async getCachedPastEvents() {
    const { eventName, logs } = await this.getPastEvents()
    this.cacheLogProgress(eventName, logs)
    return logs
  }
  async getPastEvents() {
    const eventName = 'Transfer'
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
  cacheKey(eventName) {
    const { selectedAddress } = this.context.contract.givenProvider
    return `${eventName}-${selectedAddress}`
  }
  cacheLogProgress(eventName, logs) {
    const key = this.cacheKey(eventName)
    if (!logs) {
      return this.state.cache[key]
    }
    if (logs.length) {
      const { blockNumber } = logs[logs.length - 1]
      // turn into immutablejs when you get a chance
      this.setState(({ cache }) => ({
        cache: update(cache, {
          [key]: { $set: blockNumber },
        })
      }))
      this.appendLocalStorage(key, logs)
    }
  }
  appendLocalStorage(key, newItems) {
    const items = this.getLocalStorage(key)
    const dupedItems = items.concat(newItems)
    const saveableItems = _.sortBy(_.uniqBy(dupedItems, 'id'), ['blockNumber'])
    window.localStorage.setItem(key, JSON.stringify(saveableItems, null, 2))
  }
  getLocalStorage(key) {
    let result = []
    try {
      const read = window.localStorage.getItem(key)
      if (read) {
        result = JSON.parse(read)
      }
    } catch (e) {
      console.log(e)
    } finally {
      return result
    }
  }
  async loadWarranties() {
    const { contract, web3 } = this.context
    const { givenProvider, methods } = contract
    const claims = []
    const [balanceOf, results] = await Promise.all([
      methods.balanceOf(givenProvider.selectedAddress).call(),
      this.getCachedPastEvents(),
    ])
    // loop through log results to get ones that are still owned by warrantee
    for (let i = 0; i < results.length; i += 1) {
      const { returnValues } = results[i]
      let claim = new Claim(returnValues.tokenId, web3, contract)
      claim = await claim.fetch()
      if (this.acceptClaim(claim)) {
        claims.push(claim)
        if (this.finishedAccepting(balanceOf, claims)) {
          break
        }
      }
    }
    return claims
  }
  render() {
    const { result: claims } = this.state
    if (!claims) {
      return (
        <Loader>Loading claims...</Loader>
      )
    }
    return (
      <WarrantiesContext.Provider value={{ claims }}>
        {this.renderLoaded()}
      </WarrantiesContext.Provider>
    )
  }
}
WarrantiesMatching.contextType = Web3Context
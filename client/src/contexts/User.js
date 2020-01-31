import React, { useEffect, useState, useContext } from 'react'
import BigNumber from 'bignumber.js'
import { Web3Context } from 'contexts/Web3'

const defaultAddress = '0x0'
export const UserContext = React.createContext({
  selectedAddress: defaultAddress,
  amount: new BigNumber(0),
})

// const lastKnownBlock = 0
export const Provider = (props) => {
  const { contract, web3, address } = useContext(Web3Context)
  const givenProvider = (contract ? contract.givenProvider : {})
  const { selectedAddress } = givenProvider
  const [amount, setAmount] = useState(new BigNumber(0))
  const [loading, setLoading] = useState(false)
  const user = { selectedAddress, amount, loading }
  let subscription

  useEffect(fetchBalance, [contract])
  useEffect(setupSubscription, [web3])
  return (
    <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
  )

  function fetchBalance() {
    if (!contract) {
      return
    }
    if (givenProvider.selectedAddress === defaultAddress) {
      return
    }
    setLoading(true)
    contract.methods.balance(givenProvider.selectedAddress).call().then((amount) => {
      setAmount(new BigNumber(amount || 0))
    }).catch(e => {
      console.error(e)
    }).then(() => {
      setLoading(false)
    })
  }

  function setupSubscription() {
    if (!web3) {
      return
    }
    if (subscription) {
      return
    }
    fetchBalance()
    subscription = web3.eth.subscribe('logs', {
      address,
    }, (error) => {
      if (error) {
        console.error(error)
      }
    }).on('data', (log) => {
      if (log.topics.includes('0x7d016f8eb7665cdc83ca6289966f4c4c45a0b3e2add7bd7952ebb8aca1831d01')) {
        fetchBalance()
      }
    })
    return () => subscription.unsubscribe((error, success) => {
      subscription = null
      if (error) {
        console.error(error)
      }
      if (!success) {
        console.log('failed to unsubscribe', success)
      }
    })
  }
}

import React from 'react'
import Warranty from 'contracts/Warranty.json'
import Web3 from 'web3'

export const Web3Context = React.createContext({})

export async function getUserInfo() {
  try {
    // Get network provider and web3 instance.
    const web3 = await getWeb3();

    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts();

    // Get the contract instance.
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Warranty.networks[networkId];
    const address = deployedNetwork && deployedNetwork.address
    const instance = new web3.eth.Contract(
      Warranty.abi,
      deployedNetwork && deployedNetwork.address,
    );

    // Set web3, accounts, and contract to the state, and then proceed with an
    // example of interacting with the contract's methods.
    window.contract = instance
    return {
      web3,
      address,
      accounts,
      contract: instance
    }
  } catch (error) {
    // Catch any errors for any of the above operations.
    console.error(error);
    alert(
      `Failed to load web3, accounts, or contract. Check console for details.`,
    );
  }
}

function getWeb3() {
  return new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          window.ethereum.autoRefreshOnNetworkChange = false
          await window.ethereum.enable();
          // Acccounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log('Injected web3 detected.');
        resolve(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.WebsocketProvider(
          'ws://127.0.0.1:8545'
        );
        const web3 = new Web3(provider);
        console.log('No web3 instance injected, using Local web3.');
        resolve(web3);
      }
    });
  });
}
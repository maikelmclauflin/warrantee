import React from 'react'
import Warranty from "./contracts/Warranty.json";
import getWeb3 from "./getWeb3";

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
        const instance = new web3.eth.Contract(
            Warranty.abi,
            deployedNetwork && deployedNetwork.address,
        );

        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        return {
            web3,
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
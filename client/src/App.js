import React, { Component } from "react";
import SimpleStorageContract from "./contracts/Warranty.json";
import getWeb3 from "./getWeb3";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from "react-router-dom";
import { Customer } from './Customer'
import { Home } from './Home'
import { Business } from './Business'
import { Navigation } from './Navigation'
import "./App.css";

const NavigationWithRouter = withRouter(Navigation)

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3,
        accounts,
        contract: instance
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
    }
  };

  render() {
    if (!this.state.web3) {
      return (<div>Loading Web3, accounts, and contract...</div>);
    }
    return (
      <div className="App">
        <Router>
          <NavigationWithRouter />
          <Switch>
            <Route path="/customer/">
              <Customer />
            </Route>
            <Route path="/business/">
              <Business />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;

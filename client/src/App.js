import React, { Component } from "react";
import styled from 'styled-components';
import Warranty from "./contracts/Warranty.json";
import getWeb3 from "./getWeb3";
import {
  Loader,
  Box
} from 'rimble-ui'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from "react-router-dom";
import Container from 'react-bootstrap/Container'
import { Customer } from './Customer'
import { Home } from './Home'
import { Business } from './Business/index'
import { Navigation } from './Navigation/'
import "./App.css";

const BusinessWithRouter = withRouter(Business)
const routes = [{
  to: '/',
  content: 'home'
}, {
  to: '/customer/',
  content: 'customer'
}, {
  to: '/business/',
  content: 'business'
}]
const StyleContainer = styled.div`
.container {
  margin: 0 auto;
}
.loader-text-centered {
  text-align: center;
}
.loader-centered {
  margin: 0 auto;
}
`;
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
      const deployedNetwork = Warranty.networks[networkId];
      const instance = new web3.eth.Contract(
        Warranty.abi,
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
  renderChildren() {
    if (!this.state.web3) {
      return (
        <Box mt={3}>
          <h3 className="loader-text-centered">Loading Web3, accounts, and contract...</h3>
          <Loader size="80px" className="loader-centered" />
        </Box>
      );
    }
    return (
      <Switch>
        <Route path="/customer/">
          <Customer />
        </Route>
        <Route path="/business/">
          <BusinessWithRouter contract={this.state.contract} web3={this.state.web3} />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    )
  }
  render() {
    return (
      <StyleContainer className="warranty-app">
        <Router>
          <Container>
            <Navigation list={routes} />
          </Container>
          <Box className="container">
            {this.renderChildren()}
          </Box>
        </Router>
      </StyleContainer>
    );
  }
}

export default App;

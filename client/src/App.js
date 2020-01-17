import React, { Component } from "react";
import styled from 'styled-components';
import { Web3Context } from './Web3'
import {
  Loader
} from './components/Loader'
import {
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
// import Web3 from "web3";

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

  // componentDidMount = async () => {
  // };
  renderChildren() {
    if (!this.context.web3) {
      return (
        <Box mt={3}>
          <Loader>Loading Web3, accounts, and contract...</Loader>
        </Box>
      );
    }
    return (
      <Switch>
        <Route path="/customer/">
          <Customer />
        </Route>
        <Route path="/business/">
          <BusinessWithRouter />
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
            <Navigation list={routes} user={true} />
          </Container>
          <Box className="container">
            {this.renderChildren()}
          </Box>
        </Router>
      </StyleContainer>
    );
  }
}

App.contextType = Web3Context

export default App;

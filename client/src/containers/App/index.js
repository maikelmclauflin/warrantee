import React, { Component } from 'react'
import styled from 'styled-components'
import { Provider as UserProvider } from 'contexts/User'
import { Web3Context } from 'contexts/Web3'
import { Helmet } from 'react-helmet'
import {
  Box
} from 'rimble-ui'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import { Loader } from 'components/Loader'
import { Customer } from 'containers/Customer'
import { Home } from 'containers/Home'
import { User } from 'containers/User'
import { Business } from 'containers/Business/'
import { Navigation } from 'containers/Navigation/'
import './index.css'

const CustomerWithRouter = withRouter(Customer)
const BusinessWithRouter = withRouter(Business)
const UserWithRouter = withRouter(User)
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
  margin-left: auto;
  margin-right: auto;
}
.loader-text-centered {
  text-align: center;
}
.loader-centered {
  margin: 0 auto;
}
`
export class App extends Component {
  render() {
    const { web3 } = this.context
    return (
      <UserProvider>
        <Helmet
          titleTemplate="Warrantee - %s"
          defaultTitle="Warrantee" />
        <StyleContainer className="warranty-app">
          <Router>
            {/* basename={pkg.homepage}*/}
            <Container>
              <Navigation list={routes} user={true} />
            </Container>
            <Box mt={3} className="container">
              {renderChildren(web3)}
            </Box>
          </Router>
        </StyleContainer>
      </UserProvider>
    )

    function renderChildren(web3) {
      if (!web3) {
        return (
          <Box mt={3}>
            <Loader>Loading Web3, accounts, and contract...</Loader>
          </Box>
        );
      }
      return (
        <Switch>
          <Route path="/customer/">
            <CustomerWithRouter />
          </Route>
          <Route path="/business/">
            <BusinessWithRouter />
          </Route>
          <Route path="/user/">
            <UserWithRouter />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      )
    }
  }
}

App.contextType = Web3Context

export default App;

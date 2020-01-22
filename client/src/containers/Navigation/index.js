
import React, { useContext } from 'react';
import Nav from 'react-bootstrap/Nav'
import { UserContext } from 'contexts/User'
import {
  Blockie,
  Box
} from 'rimble-ui'
import { withRouter } from 'react-router-dom'
import { Web3Context } from 'contexts/Web3';
const balanceStyles = {
  float: 'left',
  height: 30,
  lineHeight: '30px',
  marginRight: 5
}
export const Navigation = withRouter((props) => {
  const { history, list, location, user } = props
  return (
    <Web3Context.Consumer>{({ contract, web3 }) => (
      <Nav
        variant="tabs"
        activeKey={location.pathname}
        defaultActiveKey="/"
      >
        {list.map(({ to, content }) => (
          <Nav.Item key={to}>
            <Nav.Link
              eventKey={to}
              onClick={() => history.push(to)}>{content}</Nav.Link>
          </Nav.Item>
        ))}
        {(!contract || !user || !contract.givenProvider) ? [] : (<Box style={{ margin: "auto 0 auto auto" }}>
          <Balance
            web3={web3}
            methods={contract.methods}
            selectedAddress={contract.givenProvider.selectedAddress} />
          {renderUser(props, contract)}
        </Box>)}
      </Nav>
    )}</Web3Context.Consumer>
  )
})

function Balance(props) {
  const user = useContext(UserContext)
  const { web3 } = useContext(Web3Context)
  return (
    <Nav.Item key="balance" style={balanceStyles}>
      {/* {loading ? <Loader /> : []} */}
      {web3.utils.fromWei(user.amount.toString(), 'ether')} ether
    </Nav.Item>
  )
}

function renderUser(props, contract) {
  return (
    <Nav.Item key="/user/" style={{ float: 'left' }}>
      <Nav.Link
        style={{ padding: 0, fontSize: 0, border: 0 }}
        eventKey="/user/"
        onClick={() => props.history.push("/user/")}>
        <Blockie
          opts={{
            seed: contract.givenProvider.selectedAddress,
            color: "#dfe",
            bgcolor: "#a71",
            size: 15,
            scale: 2,
            spotcolor: "#000"
          }}
        />
      </Nav.Link>
    </Nav.Item>
  )
}

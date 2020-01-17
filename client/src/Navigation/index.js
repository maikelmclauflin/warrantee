
import React from 'react';
import Nav from 'react-bootstrap/Nav';
import {
    // EthAddress,
    Blockie
    // ,
    // Box
} from 'rimble-ui'
import { withRouter } from 'react-router-dom'
import { Web3Context } from '../Web3';
export const Navigation = withRouter((props) => {
    return (
        <Web3Context.Consumer>{({ contract }) => (
            <Nav
                variant="tabs"
                activeKey={props.location.pathname}
                defaultActiveKey="/"
            >
                {props.list.map(({ to, content }) => (
                    <Nav.Item key={to}>
                        <Nav.Link
                            eventKey={to}
                            onClick={() => props.history.push(to)}>{content}</Nav.Link>
                    </Nav.Item>
                ))}
                {renderUser(props, contract)}
            </Nav>
        )}</Web3Context.Consumer>
    )
})

function renderUser(props, contract) {
    if (!contract || !props.user) {
        return []
    }
    return (
        <Nav.Item key="/user/" style={{ margin: "auto 0 auto auto" }}>
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
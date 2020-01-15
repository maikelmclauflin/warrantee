import React, { Component } from "react";
import {
    Table
} from 'rimble-ui'
import {
    Switch,
    Route
} from "react-router-dom";
import { CreateWarranty } from "./CreateWarranty";
import { Navigation } from '../Navigation/';
const routes = [{
    to: 'create/',
    content: 'create'
}]
export class Business extends Component {
    render() {
        return (
            <>
                <Navigation list={routes} />
                <Switch>
                    <Route path={this.props.match.path + "create/"}>
                        <CreateWarranty contract={this.props.contract} web3={this.props.web3} />
                    </Route>
                    <Route>
                        <AllWarranties contract={this.props.contract} web3={this.props.web3} />
                    </Route>
                </Switch>
            </>
        )
    }
}

export class AllWarranties extends Component {
    state = {
        claims: []
    }
    async componentDidMount() {
        const { contract } = this.props
        const { methods, givenProvider } = contract
        const balanceOf = await methods.balanceOf(givenProvider.selectedAddress).call()
        const claims = []
        let j = 0
        while (true) {
            const claim = await methods._claims(j).call()
            if (!claim.warrantor) {
                break
            }
            if (claim.warrantor.toLowerCase() === givenProvider.selectedAddress.toLowerCase()) {
                claim.id = j
                claims.push(claim)
                if (+balanceOf === claims.length) {
                    break
                }
            }
            j += 1
        }
        this.setState({
            claims
        })
    }
    render() {
        const { utils } = this.props.web3
        console.log(utils)
        return (
            <Table striped bordered hover responsive size="sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Valuation</th>
                        <th>Value</th>
                        <th>Activated At</th>
                        <th>Expires At</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.claims.map((claim) => (
                        <tr>
                            <td>{claim.id}</td>
                            <td>{utils.fromWei(claim.valuation, 'ether')} ETH</td>
                            <td>{utils.fromWei(claim.value, 'ether')} ETH</td>
                            <td>{toDate(+claim.activatedAt)}</td>
                            <td>{toDate(+claim.activatedAt + (+claim.expiresAfter))}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        )
    }
}

function toDate(seconds) {
    return (new Date(seconds * 1000)).toISOString()
}

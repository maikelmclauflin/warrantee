import React, { Component } from 'react'
import BigNumber from 'bignumber.js'
import { Web3Context } from '../Web3'
import { toDate } from '../utils.js'
// import {
//     Link
// } from 'react-router-dom'
import {
    Flex,
    Table,
    Button,
    Text
} from 'rimble-ui'
import { Progress } from '../components/Progress'
import { Link } from '../components/Link'
import { Loader } from '../components/Loader'
import { Claim } from '../model/Claim.js'

export class AllWarranties extends Component {
    state = {
        claims: null
    }
    async componentDidMount() {
        const { contract, web3 } = this.context
        const { methods, givenProvider } = contract
        const balanceOf = await methods.balanceOf(givenProvider.selectedAddress).call()
        const claims = []
        let j = 0
        while (true) {
            let claim = new Claim(j, web3, contract)
            try {
                claim = await claim.fetch()
            } catch (e) {
                // we can basically assume we're connected since we're getting an [object Object] back here
                break
            }
            if (claim.warrantor.toLowerCase() === givenProvider.selectedAddress.toLowerCase()) {
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
        const { context, props, state } = this
        const { claims } = state
        const { web3 } = context
        const { history } = props
        const { fromWei } = web3.utils
        const createLink = (<Flex mb={3}>
            <Link to="/business/create/">
                <Button>Create a new warranty</Button>
            </Link>
        </Flex>)
        if (!claims) {
            return (
                <>
                    {createLink}
                    <Loader>Loading claims...</Loader>
                </>
            )
        }
        if (!claims.length) {
            return createLink
        }
        return (
            <>
                {createLink}
                <Table striped bordered hover responsive size="sm" mb={3}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Valuation</th>
                            <th>Value</th>
                            <th>Activated At</th>
                            <th>Expires At</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.map((claim) => {
                            const {
                                id,
                                valuation,
                                value,
                                activatedAt,
                                expiresAfter
                            } = claim
                            const convertedValuation = fromWei(valuation, 'ether')
                            const convertedValue = fromWei(value, 'ether')
                            const activatedTime = new BigNumber(activatedAt)
                            const expiresAfterTime = new BigNumber(expiresAfter)
                            const expireTime = activatedTime.plus(expiresAfterTime)
                            return (
                                <tr key={`row-${id}`} onClick={() => history.push(`warranty/${id}/`)}>
                                    <td><Text fontFamily="courier">{id}</Text></td>
                                    <td><Text fontFamily="courier">{convertedValuation}&nbsp;ETH</Text></td>
                                    <td><Text fontFamily="courier">{convertedValue}&nbsp;ETH</Text></td>
                                    <td><Text fontFamily="courier">{toDate(activatedTime)}</Text></td>
                                    <td><Text fontFamily="courier">{toDate(expireTime)}</Text></td>
                                    <td><Progress claim={claim} /></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </>
        )
    }
}
AllWarranties.contextType = Web3Context

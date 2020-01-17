import React, { Component } from "react"
import { Web3Context } from '../Web3'
import {
    Box,
    Button,
    Text as RimbleText
} from 'rimble-ui'
import { Progress } from '../components/Progress'
import { Loader } from '../components/Loader'
import { Claim } from "../model/Claim"

export class ViewWarranty extends Component {
    state = {
        claim: null
    }
    async componentDidMount() {
        const { props, context } = this
        const { match } = props
        const { contract, web3 } = context
        if (!contract) {
            return
        }
        const { id } = match.params
        const claim = new Claim(id, web3, contract)
        await claim.setup()
        if (!claim.exists()) {
            return
        }
        this.setState({
            claim
        })
    }
    renderChildren() {
        const { claim } = this.state
        if (!claim) {
            return (
                <Loader>Loading claim...</Loader>
            )
        }
        return (
            <>
                <Text title="Owner">{claim.owner}</Text>
                <Text title="Activated At">{claim.activatedTime()}</Text>
                <Text title="Expires At">{claim.expiredTime()}</Text>
                <Text title="Progress"><Progress claim={claim} /></Text>
                <Button mr={3} my={3} disabled={claim.terminated}>Terminate</Button>
                <Button.Outline mr={3} my={3} disabled={claim.terminated || claim.redeemed}>Redeem</Button.Outline>
                <Button.Outline mr={3} my={3} disabled={claim.terminated || !claim.redeemed}>Deredeem</Button.Outline>
                <Button mr={3} my={3} disabled={claim.terminated || !claim.redeemed}>Fulfill</Button>
            </>
        )
    }
    render() {
        return (
            <Box mt={3}>
                {this.renderChildren()}
            </Box>
        )
    }
}

ViewWarranty.contextType = Web3Context

function Text({ title, children }) {
    return (
        <RimbleText>
            <RimbleText.span color="#333" minWidth={120} display="inline-block">{title}:&nbsp;</RimbleText.span>
            <RimbleText.span color="#000">{children}</RimbleText.span>
        </RimbleText>
    )
}

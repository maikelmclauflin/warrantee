import React from 'react'
import { ClaimContext } from 'contexts/Claim'
import { Web3Context } from 'contexts/Web3'
import { LoadsWarranty } from './LoadsWarranty'
import { ViewWarranty } from './ViewWarranty'
import { TerminateWarranty } from './TerminateWarranty'
import { RedeemWarranty } from './RedeemWarranty'
import { DeredeemWarranty } from './DeredeemWarranty'
import { FulfillWarranty } from './FulfillWarranty'
import update from 'immutability-helper'
import {
    withRouter,
    Switch,
    Route
} from "react-router-dom"

const ViewWarrantyWithRouter = withRouter(ViewWarranty)
const TerminateWarrantyWithRouter = withRouter(TerminateWarranty)
const RedeemWarrantyWithRouter = withRouter(RedeemWarranty)
const DeredeemWarrantyWithRouter = withRouter(DeredeemWarranty)
const FulfillWarrantyWithRouter = withRouter(FulfillWarranty)

export class PerWarranty extends LoadsWarranty {
    renderLoaded() {
        const { props, state, context } = this
        const { match } = props
        const { path } = match
        const { claim } = state
        return (
            <ClaimContext.Provider value={update(context, {
                claim: { $set: claim },
                updateClaim: { $set: this.updateClaim.bind(this) },
            })}>
                <Switch>
                    <Route path={path + "terminate/"}>
                        <TerminateWarrantyWithRouter />
                    </Route>
                    <Route path={path + "redeem/"}>
                        <RedeemWarrantyWithRouter />
                    </Route>
                    <Route path={path + "deredeem/"}>
                        <DeredeemWarrantyWithRouter />
                    </Route>
                    <Route path={path + "fulfill/"}>
                        <FulfillWarrantyWithRouter />
                    </Route>
                    <Route>
                        <ViewWarrantyWithRouter />
                    </Route>
                </Switch>
            </ClaimContext.Provider>
        )
    }
}

PerWarranty.contextType = Web3Context

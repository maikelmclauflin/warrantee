import React, { Component } from "react";
import { AllWarranties } from './AllWarranties'
import { ViewWarranty } from './ViewWarranty'
import {
    withRouter,
    Switch,
    Route
} from "react-router-dom";
import { CreateWarranty } from "./CreateWarranty";
import { Navigation } from '../Navigation/';
const ViewWarrantyWithRouter = withRouter(ViewWarranty)
const AllWarrantiesWithRouter = withRouter(AllWarranties)
const routes = [{
    to: '/business/create/',
    content: 'create'
}]
export class Business extends Component {
    render() {
        const { props } = this
        const { contract, web3, match } = props
        const { path } = match
        return (
            <>
                <Navigation list={routes} />
                <Switch>
                    <Route path={path + "create/"}>
                        <CreateWarranty contract={contract} web3={web3} />
                    </Route>
                    <Route path={path + "warranty/:id/"}>
                        <ViewWarrantyWithRouter contract={contract} web3={web3} />
                    </Route>
                    <Route>
                        <AllWarrantiesWithRouter contract={contract} web3={web3} />
                    </Route>
                </Switch>
            </>
        )
    }
}


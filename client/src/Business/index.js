import React, { Component } from "react"
// import {
//     Box
// } from 'rimble-ui'
import { AllWarranties } from './AllWarranties'
import { PerWarranty } from './PerWarranty'
import {
    withRouter,
    Switch,
    Route
} from "react-router-dom"
import { CreateWarranty } from "./CreateWarranty"
// import { Navigation } from '../Navigation/'
const PerWarrantyWithRouter = withRouter(PerWarranty)
const AllWarrantiesWithRouter = withRouter(AllWarranties)
// const routes = [{
//     to: '/business/create/',
//     content: 'create'
// }]
export class Business extends Component {
    render() {
        const { props } = this
        const { match } = props
        const { path } = match
        return (
            <Switch>
                <Route path={path + "create/"}>
                    <CreateWarranty />
                </Route>
                <Route path={path + "warranty/:id/"}>
                    <PerWarrantyWithRouter />
                </Route>
                <Route>
                    <AllWarrantiesWithRouter />
                </Route>
            </Switch>
        )
    }
}


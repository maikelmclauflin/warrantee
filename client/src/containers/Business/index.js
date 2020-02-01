import React, { Component } from 'react'
import { Dashboard } from './Dashboard'
import {
  withRouter,
  Switch,
  Route
} from 'react-router-dom'
import { PerWarranty } from 'components/PerWarranty'
import { CreateWarranty } from 'components/CreateWarranty'
import { FundWarranty } from 'components/FundWarranty'
import { LinkedActions } from 'components/LinkedActions'

const PerWarrantyWithRouter = withRouter(PerWarranty)
const FundWarrantyWithRouter = withRouter(FundWarranty)
const DashboardWithRouter = withRouter(Dashboard)
const LinkedActionsWithRouter = withRouter(LinkedActions)

export class Business extends Component {
  render() {
    const { props } = this
    const { match } = props
    const { path } = match
    const linked = (<LinkedActionsWithRouter list="business" />)
    return (
      <Switch>
        <Route path={path + 'create/'}>
          {linked}
          <CreateWarranty />
        </Route>
        <Route path={path + 'fund/:id/'}>
          {linked}
          <FundWarrantyWithRouter />
        </Route>
        <Route path={path + 'fund/'}>
          {linked}
          <FundWarrantyWithRouter />
        </Route>
        <Route path={path + 'warranty/:id/'}>
          {linked}
          <PerWarrantyWithRouter />
        </Route>
        <Route>
          {linked}
          <DashboardWithRouter />
        </Route>
      </Switch>
    )
  }
}


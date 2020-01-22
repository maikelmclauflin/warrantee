import React, { Component } from 'react'
import { Dashboard } from './Dashboard'
import { PerWarranty } from './PerWarranty'
import {
  withRouter,
  Switch,
  Route
} from 'react-router-dom'
import { CreateWarranty } from 'components/CreateWarranty'
import { FundWarranties } from './FundWarranties'
import { LinkedActions } from 'components/LinkedActions'

const PerWarrantyWithRouter = withRouter(PerWarranty)
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
          <CreateWarranty guarantee={true} />
        </Route>
        <Route path={path + 'fund/'}>
          {linked}
          <FundWarranties />
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


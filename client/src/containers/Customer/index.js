import React from 'react'
import {
  Switch,
  Route,
  withRouter
} from 'react-router-dom'
import { Dashboard } from './Dashboard'
import { LinkedActions } from 'components/LinkedActions'
import { CreateWarranty } from 'components/CreateWarranty'
import { FundWarranty } from 'components/FundWarranty'

const DashboardWithRouter = withRouter(Dashboard)
const LinkedActionsWithRouter = withRouter(LinkedActions)

export const Customer = (props) => {
  const { match } = props
  const { path } = match
  const linked = (<LinkedActionsWithRouter list="customer" />)
  return (
    <Switch>
      <Route path={path + 'create/'}>
        {linked}
        <CreateWarranty guarantee={false} />
      </Route>
      <Route path={path + 'fund/'}>
        {linked}
        <FundWarranty />
      </Route>
      <Route>
        {linked}
        <DashboardWithRouter />
      </Route>
    </Switch>
  )
}

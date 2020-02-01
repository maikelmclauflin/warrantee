import React from 'react'
import { logListen } from 'utils'
import { ClaimContext } from 'contexts/Claim'
import { Web3Context } from 'contexts/Web3'
import { LoadsWarranty } from 'components/LoadsWarranty'
import { ViewWarranty } from 'components/ViewWarranty'
import { TerminateWarranty } from 'components/TerminateWarranty'
import { RedeemWarranty } from 'components/RedeemWarranty'
import { DeredeemWarranty } from 'components/DeredeemWarranty'
import { FulfillWarranty } from 'components/FulfillWarranty'
import { FundWarranty } from 'components/FundWarranty'
import { PostWarranty } from 'components/PostWarranty'
import update from 'immutability-helper'
import {
  withRouter,
  Switch,
  Route
} from "react-router-dom"

const FundWarrantyWithRouter = withRouter(FundWarranty)
const ViewWarrantyWithRouter = withRouter(ViewWarranty)
const TerminateWarrantyWithRouter = withRouter(TerminateWarranty)
const RedeemWarrantyWithRouter = withRouter(RedeemWarranty)
const DeredeemWarrantyWithRouter = withRouter(DeredeemWarranty)
const FulfillWarrantyWithRouter = withRouter(FulfillWarranty)
const PostWarrantyWithRouter = withRouter(PostWarranty)

export class PerWarranty extends LoadsWarranty {
  subscription = null
  componentDidMount() {
    this.subscription = logListen(this.context.web3, {
      address: this.context.address,
      topics: [
        "0x9cb6070e4e6933d173cce37f39b46799295f49a5148d3713bbd9caab39b696b4",
        "0xc708b61d056f0c33ad63ad27614b9476c96fd7c8553410c3c85be27cc5ae4b71",
        "0x79ff72c889eb977f60e9db2618527ce958c1f2be891bb1fac455217c07d4f645",
        "0x086c06b0f41de14dcd2062b4043c61c41fabf8b24e9ea76e5d08c56f7e8ecbce",
        "0x9a9cad27a1bdce3d7cb0602aaf727dfaad03ba6524d9bca7b9615867fa6802b4"
      ]
    }, () => {
      this.updateClaim()
    })
    return super.componentDidMount()
  }
  async componentWillUnmount() {
    await new Promise((resolve, reject) => {
      this.subscription.unsubscribe((error, success) => {
        this.subscription = null
        if (error) {
          console.error(error)
        }
        if (!success) {
          console.log('failed to unsubscribe', success)
        }
        resolve()
      })
    })
  }
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
          <Route path={path + "fund/"}>
            <FundWarrantyWithRouter />
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
          <Route path={path + "transfer/"}>
            <PostWarrantyWithRouter />
          </Route>
          <Route>
            <ViewWarrantyWithRouter claim={claim} level="../../" />
          </Route>
        </Switch>
      </ClaimContext.Provider>
    )
  }
}

PerWarranty.contextType = Web3Context

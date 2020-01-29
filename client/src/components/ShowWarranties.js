import React from 'react'
import BigNumber from 'bignumber.js'
import { Web3Context } from 'contexts/Web3'
import { toDate } from 'utils'
import {
  Table,
  Text
} from 'rimble-ui'
import { Progress } from 'components/Progress'
import {
  WarrantiesMatching,
  WarrantiesContext,
} from 'components/WarrantiesMatching'

export class ShowWarranties extends WarrantiesMatching {
  renderLoaded() {
    const { context, props } = this
    const { web3 } = context
    const { history, match } = props
    const { fromWei } = web3.utils
    return (
      <WarrantiesContext.Consumer>
        {({ claims }) => (!claims.length ? [] :
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
                console.log(claim)
                const title = `${JSON.stringify({
                  id,
                  valuation,
                  value,
                  activatedTime: toDate(activatedTime),
                  expireTime: toDate(expireTime),
                  warrantee: claim.warrantee,
                  warrantor: claim.warrantor,
                  states: claim.states(),
                }, null, 2)}`
                return (
                  <tr key={`row-${id}`} title={title} onClick={() => history.push(`${match.path}warranty/${id}/`)} style={{ cursor: 'pointer' }}>
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
        )}</WarrantiesContext.Consumer>
    )
  }
}
ShowWarranties.contextType = Web3Context

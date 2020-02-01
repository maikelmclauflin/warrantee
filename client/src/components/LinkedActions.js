import React from 'react'
import {
  Flex,
  Box,
  Button
} from 'rimble-ui'
import { Link } from 'components/Link'
const categories = {
  customer: {
    create: 'Create',
    // fund: 'Fund',
    // sell: 'Sell',
  },
  business: {
    create: 'Create',
    fund: 'Fund',
    guarantee: 'Guarantee',
    // transfer: 'Transfer',
  },
}
export const LinkedActions = ({ match, list, level = '/' }) => {
  const actions = []
  const keys = []
  const texts = categories[list]
  for (let key in texts) {
    if (match && match.path.includes(`/${key}/`)) {
      continue
    }
    keys.push(key)
  }
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]
    actions.push(
      <LinkedAction
        key={key}
        mr={(i < keys.length - 1) ? 3 : 0}
        to={`${level}${list}/${key}/`}>
        {texts[key]}
      </LinkedAction>
    )
  }
  return (
    <Flex mb={3}>
      <LinkedAction mr={3} to="..">
        Back
      </LinkedAction>
      {actions}
    </Flex>
  )
}

function LinkedAction({ mr, to, children }) {
  return (
    <Box mr={mr}>
      <Link to={to}>
        <Button>{children}</Button>
      </Link>
    </Box>
  )
}
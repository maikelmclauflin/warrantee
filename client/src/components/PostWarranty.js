import React from 'react'
import {
  Flex,
  Box,
  Field,
  Card,
  Input,
  Button,
  Loader as RimbleLoader
} from 'rimble-ui'
import { Helmet } from 'react-helmet'
import {
  Form,
  FormContext
} from 'components/Form'
import { post as postSchema } from 'schemas'
import { Web3Context } from 'contexts/Web3'
import { ignoreReject } from 'utils'
import { Processor } from 'components/Processor'
import { deleteClaim } from 'model/Claim'

export class PostWarranty extends Processor {
  processorMethod = 'post'
  toastConfig = {
    processing: () => ({ message: 'Posting Claim...' }),
    success: () => ({ message: 'Claim Available for Backing' }),
    failure: (error) => ({
      message: 'Unable to Post Claim',
      options: {
        variant: 'failure',
        secondaryMessage: error.toString(),
      }
    }),
  }
  onSubmit(inputs) {
    return this.process(inputs)
  }
  async post(inputs) {
    const { context } = this
    const { contract, web3 } = context
    const { methods } = contract
    const { id, account } = inputs
    const { selectedAddress } = web3.givenProvider
    return ignoreReject(async () => {
      await methods.postClaim(id, account).send({
        from: selectedAddress,
      })
      deleteClaim(id) // from cache
      return true
    })
  }
  render() {
    const { props, state, onSubmit } = this
    const { match = {} } = props
    const { params = {} } = match
    const { id } = params
    const { processing, error } = state
    return (
      <Card p={3} mt={3}>
        {this.toastMessage()}
        <Helmet>
          <title>Post Claim for Transfer</title>
        </Helmet>
        <Form onSubmit={onSubmit.bind(this)}
          validation={postSchema}
          defaultInputs={{
            id,
            account: '',
          }}>
          <Flex mx={3} flexWrap='wrap'>
            <h3>Post a Claim for Transfer</h3>
          </Flex>
          <FormContext.Consumer>{({ onChange, inputs, valid, validateds }) => (
            <Flex mt={3} flexWrap='wrap'>
              <Box width={[1, 1, 1 / 2]} px={3}>
                <Field label='ID to guarantee' width={1} validated={validateds.id}>
                  <Input
                    width={1}
                    type='number'
                    required={true}
                    value={inputs.id || ''}
                    onChange={(e) => onChange('id', e)} />
                </Field>
              </Box>
              <Box width={[1, 1, 1 / 2]} px={3}>
                <Field label='Account that can purchase the claim' width={1} validated={validateds.account}>
                  <Input
                    width={1}
                    type='text'
                    required={true}
                    value={inputs.account || ''}
                    onChange={(e) => onChange('account', e)} />
                </Field>
              </Box>
              <Box width={[1, 1, 1 / 2]} px={3} my={3}>
                <Button
                  type='submit'
                  disabled={processing || !valid}>
                  Post Claim for Transfer&nbsp;{processing ? <RimbleLoader color='white' /> : []}
                </Button>
              </Box>
              {error ? <Box width={1} px={3} my={3}>
                <pre>{error.toString()}</pre>
              </Box> : []}
            </Flex>
          )}</FormContext.Consumer>
        </Form>
      </Card>
    )
  }
}

PostWarranty.contextType = Web3Context

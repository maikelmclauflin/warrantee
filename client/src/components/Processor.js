import React, { Component } from 'react'
import { ToastMessage } from 'rimble-ui'
import _ from 'lodash'
import update from 'immutability-helper'

export class Processor extends Component {
  toastProvider = null
  toastConfig = {}
  componentWillUnmount() {
    this.toastProvider = null
  }
  state = {
    processed: 0,
    processing: 0,
    error: null,
    result: null,
  }
  async process(arg) {
    if (this.state.processing) {
      return
    }
    this.setState(({ processing }) => ({
      processing: processing + 1,
    }))
    this.renderToast('processing')
    let result
    let error
    try {
      result = await this[this.processorMethod](arg)
      if (result) {
        this.setState(() => ({
          result,
          error: null,
        }))
        this.renderToast('success')
      }
    } catch (err) {
      console.log(err)
      error = err
      this.setState(() => ({
        error: err,
      }))
      this.renderToast('failure', err)
    } finally {
      this.endProcess(error)
    }
    return result
  }
  renderToast(key, error) {
    const { toastProvider, toastConfig } = this
    if (!toastProvider || !toastConfig) {
      return
    }
    const configGen = toastConfig[key]
    if (!configGen) {
      return
    }
    const generated = _.isFunction(configGen) ? configGen(error || null, this) : configGen
    const { options, message } = update({
      options: {
        variant: key,
      }
    }, {
      message: { $set: generated.message },
      options: { $merge: generated.options || {} },
    })
    toastProvider.addMessage.apply(toastProvider, [message, options])
  }
  endProcess(error) {
    this.setState(({ processed, processing }) => ({
      processed: processed + 1,
      processing: processing - 1,
    }))
  }
  toastMessage(props = {}) {
    return <ToastMessage.Provider {...props} ref={node => (this.toastProvider = node)} />
  }
}

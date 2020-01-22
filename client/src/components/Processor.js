import React, { Component } from 'react'
import { ToastMessage } from 'rimble-ui'
import _ from 'lodash'

export class Processor extends Component {
  toastProvider = null
  generateToastMessage = {}
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
    let result
    let error
    try {
      result = await this[this.processorMethod](arg)
      this.setState(() => ({
        result,
        error: null,
      }))
    } catch (err) {
      console.log(err)
      error = err
      this.setState(() => ({
        error: err,
      }))
    } finally {
      this.endProcess(error)
    }
    return result
  }
  endProcess(error) {
    this.setState(({ processed, processing }) => ({
      processed: processed + 1,
      processing: processing - 1,
    }))
    const { toastProvider, generateToastMessage } = this
    if (this.toastProvider && !error) {
      const args = _.isObject(generateToastMessage) ? [
        generateToastMessage.message,
        generateToastMessage.options,
      ] : generateToastMessage(this)
      toastProvider.addMessage.apply(toastProvider, args)
    }
  }
  toastMessage(generateToastMessage) {
    this.generateToastMessage = generateToastMessage
    return <ToastMessage.Provider ref={node => (this.toastProvider = node)} />
  }
}

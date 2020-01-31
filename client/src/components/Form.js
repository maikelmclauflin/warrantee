import React, { Component } from 'react'
import _ from 'lodash'
import { Form as RimbleForm } from 'rimble-ui'
import update from 'immutability-helper'

export const FormContext = React.createContext({
  inputs: {},
  valid: false,
  onChange: () => { }
})

export class Form extends Component {
  state = {
    inputs: {}
  }
  constructor(props) {
    super(props)
    this.state = {
      onChange: this.onChange.bind(this),
      valid: false,
      inputs: props.defaultInputs || {},
      validateds: {},
    }
    this.state.valid = this.isValid()
  }
  componentDidUpdate(prevProps) {
    const { defaultInputs = {} } = this.props
    if (!_.isEqual(defaultInputs, prevProps.defaultInputs)) {
      return this.resetState(defaultInputs)
    }
  }
  validate(inputs) {
    if (!this.props.validation) {
      return {}
    }
    return this.props.validation.validate(inputs || this.state.inputs)
  }
  isValid(inputs) {
    const result = this.validate(inputs)
    return !result.error
  }

  async onSubmit(e) {
    e.preventDefault()
    e.stopPropagation()
    await this.props.onSubmit(this.state.inputs)
    this.resetState()
  }
  resetState(defaultInputs = {}) {
    this.setState({
      valid: false,
      inputs: defaultInputs || {},
      validateds: {},
    })
  }
  setInputs(key, value) {
    this.setState(({ inputs, validateds }) => {
      const futureInputs = update(inputs, {
        [key]: { $set: value },
      })
      const futureValidateds = update(validateds, {
        [key]: { $set: validateds[key] || true },
      })
      const valid = this.isValid(futureInputs)
      return {
        valid,
        inputs: futureInputs,
        validateds: futureValidateds,
      }
    })
  }
  onChange(key, e) {
    this.setInputs(key, e.target.value)
  }
  render() {
    return (
      <RimbleForm onSubmit={this.onSubmit.bind(this)} validated={this.state.valid}>
        <FormContext.Provider value={this.state}>{this.props.children}</FormContext.Provider>
      </RimbleForm>
    )
  }
}

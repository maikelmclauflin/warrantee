import React, { Component } from 'react'
import { Link as RRLink } from 'react-router-dom'

export class Link extends Component {
    ref = null
    render() {
        return (
            <RRLink style={{
                display: "inline-block",
            }} ref={(ref) => { this.ref = ref }} onClick={(e) => {
                const { ref } = this
                if (ref) {
                    for (const child of ref.children) {
                        if (child.disabled) {
                            e.preventDefault()
                        }
                    }
                }
            }} {...this.props} />
        )
    }
}
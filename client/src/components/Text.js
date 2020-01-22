import React from 'react'
import {
    Text as RimbleText
} from 'rimble-ui'

export function Text({ title, children }) {
    return (
        <RimbleText>
            <RimbleText.span color="#333" minWidth={120} display="inline-block">{title}:&nbsp;</RimbleText.span>
            <RimbleText.span color="#000">{children}</RimbleText.span>
        </RimbleText>
    )
}

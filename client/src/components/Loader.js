import React from "react"
import {
    Loader as RimbleLoader
} from 'rimble-ui'

export const Loader = ({ children }) => (
    <>
        <h3 className="loader-text-centered">{children}</h3>
        <RimbleLoader size="80px" className="loader-centered" />
    </>
)

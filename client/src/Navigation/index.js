
import React from 'react';
import Nav from 'react-bootstrap/Nav';
import { withRouter } from 'react-router-dom'
export const Navigation = withRouter((props) => {
    console.log(props)
    return (
        <Nav
            variant="pills"
            activeKey={props.location.pathname}
            defaultActiveKey="/"
        >
            {props.list.map(({ to, content }) => (
                <Nav.Item key={to}>
                    <Nav.Link
                        eventKey={to}
                        onClick={() => props.history.push(to)}>{content}</Nav.Link>
                </Nav.Item>
            ))}
        </Nav>
    )
})
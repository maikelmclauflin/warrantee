import React from 'react';
import Nav from 'react-bootstrap/Nav';
// import { Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';
const list = [{
    to: '/',
    content: 'home'
}, {
    to: '/customer/',
    content: 'customer'
}, {
    to: '/business/',
    content: 'business'
}]
export const Navigation = (props) => {
    return (
        <Nav
            variant="pills"
            activeKey={props.location.pathname}
            defaultActiveKey="/"
        >
            {list.map(({ to, content }) => (
                <Nav.Item key={to}>
                    <Nav.Link eventKey={to} onClick={() => {
                        props.history.push(to)
                    }}>{content}</Nav.Link>
                </Nav.Item>
            ))}
        </Nav>
    )
}
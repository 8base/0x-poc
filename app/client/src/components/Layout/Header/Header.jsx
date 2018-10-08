// External libraries
import React, { Component } from "react";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

// Styling
import "./Header.css";

class Header extends Component {
    render() {
        return (
            <Navbar>
                <Navbar.Header>
                    <Navbar.Brand>RegDEX</Navbar.Brand>
                </Navbar.Header>

                <Nav>
                    <LinkContainer to="/" exact={true}>
                        <NavItem>Orderbook</NavItem>
                    </LinkContainer>

                    <LinkContainer to="/create">
                        <NavItem>Create</NavItem>
                    </LinkContainer>
                </Nav>
            </Navbar>
        );
    }
}

export default Header;

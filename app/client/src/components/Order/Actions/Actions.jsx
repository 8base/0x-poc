import React, { Component } from "react";
import { Button } from "react-bootstrap";

// Styling
import "./Actions.css";

class Actions extends Component {
    handleClick(event, callback) {
        event.preventDefault();

        callback();
    }

    render() {
        const { onFill } = this.props;

        return (
            <div className="Actions">
                <Button
                    onClick={(event) => this.handleClick(event, onFill)}                    
                    bsStyle="primary"
                    className="Actions-Fill">
                    Fill Order
                </Button>
            </div>
        );
    }
}

export default Actions;

// External libraries
import React, { Component } from "react";

// Components
import Tokens from "../components/Tokens/Tokens";

// Contexts
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";

class TokensContainer extends Component {
    render() {
        return (
            <DharmaConsumer>
                {(dharmaProps) => {
                    return <Tokens tokens={dharmaProps.tokens} />;
                }}
            </DharmaConsumer>
        );
    }
}

export default TokensContainer;
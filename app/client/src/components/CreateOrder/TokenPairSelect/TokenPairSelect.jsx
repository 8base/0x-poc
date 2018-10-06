import React, { Component } from "react";
import { FormControl } from "react-bootstrap";

class TokenPairSelect extends Component {
    render() {
        const { name, onChange, defaultValue, tokenPairs } = this.props;

        return (
            <FormControl
                name={name}
                onChange={onChange}
                componentClass="select"
                placeholder="select"
                defaultValue={defaultValue}>
                {tokenPairs.map((tokenPair) => (
                    <option key={tokenPair.id} value={tokenPair.id}>
                        {tokenPair.name}
                    </option>
                ))}
            </FormControl>
        );
    }
}

export default TokenPairSelect;

import React, { Component } from "react";
import { Alert } from "react-bootstrap";

const MAX_RETRIES = 10;

const TX_STATES = {
    awaiting: "awaiting",
    timedOut: "timedOut",
    success: "success",
};

const TX_STATE_TO_STYLE = {
    awaiting: "warning",
    timedOut: "danger",
    success: "success",
};

const TX_STATE_TO_TITLE = {
    awaiting: "Awaiting Transaction to be Mined",
    timedOut: "This Transaction seems to be taking a while...",
    success: "Transaction Complete",
};

class TransactionManager extends Component {
    constructor(props) {
        super(props);

        this.state = {
            txState: TX_STATES.awaiting,
            numRetries: 0,
        };

        this.retry = this.retry.bind(this);
        this.awaitTransactionMined = this.awaitTransactionMined.bind(this);
    }

    componentDidMount() {
        this.awaitTransactionMined();
    }

    awaitTransactionMined() {
        const { web3Wrapper, txHash, onSuccess } = this.props;

        web3Wrapper
            .awaitTransactionSuccessAsync(txHash)
            .then(() => {
                this.setState({
                    txState: TX_STATES.success,
                    numRetries: 0,
                });

                onSuccess();
            })
            .catch(this.retry);
    }

    retry() {
        const { numRetries } = this.state;

        if (numRetries === MAX_RETRIES) {
            this.setState({
                txState: TX_STATES.timedOut,
                numRetries: 0,
            });
            return;
        }

        this.awaitTransactionMined();

        this.setState({
            numRetries: numRetries + 1,
        });
    }

    render() {
        const { txState } = this.state;
        const { txHash, description } = this.props;

        return (
            <Alert bsStyle={TX_STATE_TO_STYLE[txState]}>
                <h4>{TX_STATE_TO_TITLE[txState]}</h4>
                <p>{description}</p>
                <p>
                    <a href={`https://etherscan.io/tx/${txHash}`} target="_blank">
                        Transaction Details
                    </a>
                </p>
            </Alert>
        );
    }
}

export default TransactionManager;

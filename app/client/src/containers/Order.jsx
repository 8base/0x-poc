// External libraries
import React, { Component } from "react";

// Components
import Order from "../components/Order/Order";

// Helpers
import OrderLoader from "../services/OrderLoader";

class OrderContainer extends Component {
  onCompletion = () => {
    this.props.history.push(`/`);
  }

  render() {
    const { hash } = this.props.match.params;
    return (
      <OrderLoader hash={hash}>
        {({ order, error, fillOrder, transactions, web3Wrapper }) => (
          <Order
            order={order}
            error={error}
            fillOrder={fillOrder}
            web3Wrapper={web3Wrapper}
            transactions={transactions}
            onCompletion={this.onCompletion}
          />
        )}
      </OrderLoader>
    );
  }
}

export default OrderContainer;

// External libraries
import React, { Component } from "react";

// Components
import CreateOrder from "../components/CreateOrder/CreateOrder";

// Services
import OrderCreator from '../services/OrderCreator';
import getZeroEx from './../services/getZeroEx';


class CreateOrderContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tokenPairs: [],
    };

    this.onCompletion = this.onCompletion.bind(this);
  }

  /**
   * When the loan request is created, we redirect the user back to the table that includes
   * all of the loan requests, and highlight the newly created request.
   */
  onCompletion(orderHash) {
    this.props.history.push(`/order/${orderHash}`);
  }

  async componentDidMount() {
    const { contractWrappers } = await getZeroEx;
    const WETH_ADDRESS = contractWrappers.etherToken.getContractAddressIfExists(); // The wrapped ETH token contract
    const ZRX_ADDRESS = contractWrappers.exchange.getZRXTokenAddress(); // The ZRX token contract
    const tokenPairs = [
      {
        id: "1",
        name: "ZRX /w ETH",
        tokenA: {
          address: WETH_ADDRESS,
          decimals: 18,
          symbol: "WETH"
        },
        tokenB: {
          address: ZRX_ADDRESS,
          decimals: 18,
          symbol: "ZRX"
        }
      }
    ];

    console.log('tokenPairs', tokenPairs);
    this.setState({ tokenPairs });
  }

  render() {
    const { tokenPairs } = this.state;    
    return (
      <OrderCreator>
        {(createOrder) => (
          <CreateOrder
            onCompletion={this.onCompletion}
            handleCreateOrder={createOrder}
            tokenPairs={tokenPairs}
          />
        )}
      </OrderCreator>
    );
  }
}

export default CreateOrderContainer;

// External libraries
import { Component } from "react";
import { withApollo } from 'react-apollo';
import { compose } from 'react-apollo';
import { signatureUtils, SignerType, orderHashUtils } from '0x.js';

import getZeroEx from './getZeroEx';

// API
import { ORDER_CREATE } from "../services/graphql/mutations";

class OrderCreator extends Component {
  constructor(props) {
    super(props);

    this.createOrder = this.createOrder.bind(this);    
  }

  async createOrder(params) {
    const { client } = this.props;
    const { contractWrappers, providerEngine } = await getZeroEx;

    const {
      makerAddress,
      takerAddress,
      feeRecipientAddress,
      makerAssetData,
      takerAssetData,
      senderAddress,
      exchangeAddress,
      salt,
      makerFee,
      takerFee,
      makerAssetAmount,
      takerAssetAmount,
      expirationTimeSeconds,
      isBuy
    } = params;

    const order = {
      makerAddress,
      takerAddress,
      feeRecipientAddress,
      makerAssetData,
      takerAssetData,
      senderAddress,
      exchangeAddress,
      salt,
      makerFee,
      takerFee,
      makerAssetAmount,
      takerAssetAmount,
      expirationTimeSeconds,
      isBuy 
    };

    console.log('order:', order);

    // Create orderHash
    const orderHash = orderHashUtils.getOrderHashHex(order);    

    // Signing orderHash -> signature    
    const signature = await signatureUtils.ecSignOrderHashAsync(providerEngine, orderHash, makerAddress, SignerType.Metamask);    

    // Appending signature to order
    const signedOrder = {
      ...order,
      signature,
    };

    console.log('signedOrder:', signedOrder);

    // Create Loan Request and update local cache
    const { data: { orderCreate: { id } } } = await client.mutate(
      {
        mutation: ORDER_CREATE,
        variables: { data: signedOrder },
        refetchQueries: ['ordersList', 'orderbook']        
      });

    return id;
  }

  render() {
    const { children } = this.props;
    return children(this.createOrder);
  }
};


export default compose(
  withApollo
)(OrderCreator);
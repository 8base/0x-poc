// External libraries
import { Component } from "react";
import { withApollo } from 'react-apollo';
import { compose } from 'react-apollo';
import { BigNumber } from '@0xproject/utils';

// config
import config from '../config';

import { getTokenMetaData } from './tokenMetadata';

// API
import { ORDERBOOK as ORDERBOOK_QUERY } from "../services/graphql/queries"
import { ORDER_STATE_1 as ORDER_STATE_SUBSCRIPTION } from "../services/graphql/subscriptions"

class TokenPairsLoader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orderbook: { bids:[], asks:[] },
      isLoading: true,
      query: null,
      subscription: null
    };

    this.parseOrderbook = this.parseOrderbook.bind(this);
    this.parseOrder = this.parseOrder.bind(this);
  }

  async componentDidMount() {
    // Get ApolloClient instance        
    const { client, baseAssetData, quoteAssetData } = this.props;
    try {
      const query = client.watchQuery({
        query: ORDERBOOK_QUERY,
        variables: {
          baseAssetData,
          quoteAssetData
        }
      });

      const subscriptionFilter = {
        exchangeAddress: {
          equals: "0x48bacb9266a570d521063ef5dd96e61686dbe788"
        } 
      };

      const subscribeResult =  query.subscribeToMore({
        document: ORDER_STATE_SUBSCRIPTION,        
        updateQuery: (prev, { subscriptionData }) => {
          console.log('subscriptionData', subscriptionData);
          if (!subscriptionData.data) return prev;                 
        },
        onError: (err) => { console.log(`Subscription error: ${err}`) }
      });

      const subscription = query.subscribe({
        next: async ({ data }) => {
          console.log('next', data);
          if (data) {
            const orderbook = await this.parseOrderbook(data);
            this.setState({ orderbook, isLoading: false });
          }
        },
        error: (err) => { console.log(`Finished with error: ${err}`) },
        complete: () => { console.log('Finished') }
      });  

      await query.result();

      this.setState({ query, subscription });
    } catch (error) {
      console.error(error)
    }
  }


  componentWillUnmount() {
    const { subscription } = this.state;
    subscription.unsubscribe();
  }


  async parseOrderbook(orderbookData) {
    return {
      bids: await Promise.all(orderbookData.bids.map(order => this.parseOrder(order, true))),
      asks: await Promise.all(orderbookData.asks.map(order => this.parseOrder(order, false)))
    }
  }

  parseOrder(order, isBid) {    
    const makerAssetAmount = new BigNumber(order.makerAssetAmount);
    const takerAssetAmount = new BigNumber(order.takerAssetAmount); 
    const price = isBid ? makerAssetAmount.dividedBy(takerAssetAmount) : takerAssetAmount.dividedBy(makerAssetAmount);

    return new Promise(async (resolve) => {
        resolve({
          ...order,          
          makerAssetAmount,
          takerAssetAmount,
          price,
          makerAssetMetadata: await getTokenMetaData(order.makerAssetData),
          takerAssetMetadata: await getTokenMetaData(order.takerAssetData),
        });
    });
  }

  render() {
    const { children } = this.props;
    const orderbookProps = {
      orderbook: this.state.orderbook,
      isLoading: this.state.isLoading
    };

    return children(orderbookProps);
  }
}

export default compose(
  withApollo
)(OrderbookLoader);

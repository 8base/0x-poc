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
import { ORDER_STATE_1 as ORDER_STATE_SUBSCRIPTION, ORDER_1 as ORDER_SUBSCRIPTION } from "../services/graphql/subscriptions"

class OrderbookLoader extends Component {
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
        fetchPolicy: 'network-only',
        variables: {
          baseAssetData,
          quoteAssetData
        }
      });
      
      /*const subscriptionFilter = {
        OR: [
          {
            AND: {
              makerAssetData: {
                equals: baseAssetData
              },
              takerAssetData: {
                equals: quoteAssetData
              }
            }
          },
          {
            AND: {
              makerAssetData: {
                equals: quoteAssetData
              },
              takerAssetData: {
                equals: baseAssetData
              }
            }
          }
        ]
      };*/

      /*const subscriptionFilter = {
        exchangeAddress: {
          equals: "0x35dD2932454449b14Cee11A94d3674a936d5d7b2"
        } 
      };

      const subscribeResult =  query.subscribeToMore({
        document: ORDER_STATE_SUBSCRIPTION,        
        updateQuery: (prev, { subscriptionData }) => {
          console.log('subscriptionData', subscriptionData);
          if (!subscriptionData.data) return prev;
          query.refetch({ baseAssetData, quoteAssetData });
        },
        onError: (err) => { console.log(`Subscription error: ${err}`) }
      });

      const subscribeOrderResult =  query.subscribeToMore({
        document: ORDER_SUBSCRIPTION,        
        updateQuery: (prev, { subscriptionData }) => {
          console.log('subscriptionData order', subscriptionData);
          if (!subscriptionData.data) return prev;
          query.refetch({ baseAssetData, quoteAssetData });
        },        
        onError: (err) => { console.log(`Subscription error: ${err}`) }
      });*/

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
          makerAssetMetadata: { symbol: "ETH" }, //await getTokenMetaData(order.makerAssetData),
          takerAssetMetadata: { symbol: "ZRX" } //await getTokenMetaData(order.takerAssetData),
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

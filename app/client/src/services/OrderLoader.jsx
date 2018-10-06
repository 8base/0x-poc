// External libraries
import { Component } from "react";
import { withApollo } from 'react-apollo';
import { compose } from 'react-apollo';
import { BigNumber } from '@0xproject/utils';
import { ZeroEx } from '0x.js';
import Web3 from 'web3';
import getZeroEx from './getZeroEx';
// config
import config from '../config';
import { getTokenMetaData } from './tokenMetadata';


// API
import { ORDER_BY_HASH as ORDER_QUERY } from "../services/graphql/queries"
import { UPDATE_ORDER_STATE } from "../services/graphql/mutations"

//const ethers = require('ethers');

const wyreFilterConfig = require('./contracts/WyreFilter');

const FILTER_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "components": [
          {
            "name": "makerAddress",
            "type": "address"
          },
          {
            "name": "takerAddress",
            "type": "address"
          },
          {
            "name": "feeRecipientAddress",
            "type": "address"
          },
          {
            "name": "senderAddress",
            "type": "address"
          },
          {
            "name": "makerAssetAmount",
            "type": "uint256"
          },
          {
            "name": "takerAssetAmount",
            "type": "uint256"
          },
          {
            "name": "makerFee",
            "type": "uint256"
          },
          {
            "name": "takerFee",
            "type": "uint256"
          },
          {
            "name": "expirationTimeSeconds",
            "type": "uint256"
          },
          {
            "name": "salt",
            "type": "uint256"
          },
          {
            "name": "makerAssetData",
            "type": "bytes"
          },
          {
            "name": "takerAssetData",
            "type": "bytes"
          }
        ],
        "name": "order",
        "type": "tuple"
      },
      {
        "name": "takerAssetFillAmount",
        "type": "uint256"
      },
      {
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "conditionalFillOrder",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const FILTER_TOKEN_ADDRESS = '0x77190f37303bea47fc61c9d3a94412d97e7fabe0';

function toTuple (obj) {
  if (!(obj instanceof Object)) {
    return [];
  }
  var output = [];
  var i = 0;
  Object.keys(obj).forEach((k) => {
    if (obj[k] instanceof Object) {
      output[i] = toTuple(obj[k]);
    } else if (obj[k] instanceof Array) {
      let j1 = 0;
      let temp1 = [];
      obj[k].forEach((ak) => {
        temp1[j1] = toTuple(obj[k]);
        j1++;
      });
      output[i] = temp1;
    } else {
      output[i] = obj[k];
    }
    i++;
  });
  return output;
}

const fillOrderAsync = (web3, signedOrder) => {
  return new Promise(async (resolve, reject) => {
 //   console.log('web3.getProvider()', web3.getProvider());
///    const provider = ethers.getDefaultProvider();
//    const filterContractInstance = new ethers.Contract(FILTER_TOKEN_ADDRESS, FILTER_ABI, provider);

    console.log('web3', web3);
    const filterContractInstance = new web3.eth.Contract(FILTER_ABI, FILTER_TOKEN_ADDRESS);
//    const filterContractInstance = FilterContract.at(FILTER_TOKEN_ADDRESS);
    console.log('filterContractInstance', filterContractInstance);
    const order = {
      makerAddress: signedOrder.makerAddress,
      takerAddress: signedOrder.takerAddress,
      feeRecipientAddress: signedOrder.feeRecipientAddress,
      senderAddress: signedOrder.senderAddress,
      makerAssetAmount: 1, //signedOrder.makerAssetAmount,
      takerAssetAmount: 1, //signedOrder.takerAssetAmount,
      makerFee: signedOrder.makerFee,
      takerFee: signedOrder.takerFee,
      expirationTimeSeconds: 1, //signedOrder.expirationTimeSeconds,
      salt: signedOrder.salt,
      makerAssetData: signedOrder.makerAssetData,
      takerAssetData: signedOrder.takerAssetData
    };

//    console.log(toTuple(order), signedOrder.signature);
    console.log("filterContractInstance = ", filterContractInstance);
    const txHash = await filterContractInstance.methods.conditionalFillOrder(
      order, order.takerAssetAmount, signedOrder.signature/*, (error, result) => {
        if (error) {
          console.log('error', error);
          return reject(error);
        }
        console.log('Filled:', txHash, result);
        return resolve(result);
    }*/).send({from: signedOrder.takerAddress});
    console.log("txHash = ", txHash);
  });
};

class OrderLoader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      order: null,
      isLoading: true,
      query: null,
      subscription: null,
      transactions: [],
    };

    this.parseOrder = this.parseOrder.bind(this);
    this.fillOrder = this.fillOrder.bind(this);
  }

  async componentDidMount() {
    // Get ApolloClient instance
    const { client, hash } = this.props;
    const { web3Wrapper } = await getZeroEx;



    try {
      const query = client.watchQuery({
        query: ORDER_QUERY,
        variables: {
          hash
        }
      });

      const subscription = query.subscribe({
        next: async ({ data }) => {
          console.log('next', data);
          if (data && data.ordersList && data.ordersList.length > 0) {
            const order = await this.parseOrder(data.ordersList[0]);
            this.setState({ order, isLoading: false });
          }
        },
        error: (err) => { console.log(`Finished with error: ${err}`) },
        complete: () => { console.log('Finished') }
      });

      await query.result();

      this.setState({ query, subscription, web3Wrapper });
    } catch (error) {
      console.error(error)
    }
  }


  componentWillUnmount() {
    const { subscription } = this.state;
    subscription.unsubscribe();
  }


  parseOrder(order) {
    return new Promise(async (resolve) => {
      const makerAssetAmount = new BigNumber(order.makerAssetAmount);
      const takerAssetAmount = new BigNumber(order.takerAssetAmount);
      resolve({
        ...order,
        makerAssetAmount,
        takerAssetAmount,
        expirationTimeSeconds: new BigNumber(order.expirationTimeSeconds),
        makerAssetMetadata: { symbol: "ETH" }, //await getTokenMetaData(order.makerAssetData),
        takerAssetMetadata: { symbol: "ZRX" }, //await getTokenMetaData(order.takerAssetData),
        price: order.isBuy ? makerAssetAmount.dividedBy(takerAssetAmount) : takerAssetAmount.dividedBy(makerAssetAmount)
      });
    });
  }

  async fillOrder() {
    const { order } = this.state;
    const { client } = this.props;
    const { contractWrappers, web3Wrapper, providerEngine, web3 } = await getZeroEx;

    const shouldThrowOnInsufficientBalanceOrAllowance = true;
    const filltakerAssetAmount = new BigNumber(order.takerAssetAmount);
    const accounts = await web3Wrapper.getAvailableAddressesAsync();
    console.log('accounts', accounts);
    const takerAddress = accounts[0];


    // Filling order
    const txHash = await fillOrderAsync(web3, order);

    const { transactions } = this.state;
    transactions.push({ txHash, description: "Order Fill" });

    this.setState({
      transactions
    });

    // Transaction receipt
    const txReceipt = await web3Wrapper.awaitTransactionSuccessAsync(txHash);
    // Create Loan Request and update local cache
    await client.mutate(
      {
        mutation: UPDATE_ORDER_STATE,
        variables: { id: order.id, isValid: false },
        refetchQueries: ['ordersList', 'orderbook']
      });
  }

  render() {
    const { children } = this.props;
    const { web3Wrapper } = this.state;

    const orderProps = {
      order: this.state.order,
      isLoading: this.state.isLoading,
      fillOrder: this.fillOrder,
      transactions: this.state.transactions,
      web3Wrapper
    };

    return children(orderProps);
  }
}

export default compose(
  withApollo
)(OrderLoader);

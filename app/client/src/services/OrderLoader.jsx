// External libraries
import { Component } from "react";
import { withApollo } from 'react-apollo';
import { compose } from 'react-apollo';
import { BigNumber } from '@0xproject/utils';
import { assetDataUtils, generatePseudoRandomSalt } from '0x.js';
import Web3 from 'web3';
import getZeroEx from './getZeroEx';
// config
import config from '../config';
import { getTokenMetaData } from './tokenMetadata';


// API
import { ORDER_BY_HASH as ORDER_QUERY } from "../services/graphql/queries"
import { UPDATE_ORDER_VALID } from "../services/graphql/mutations"

const ethers = require('ethers');

const wyreFilterConfig = require('./contracts/WyreFilter');

const FILTER_ABI = [
  {
    "inputs": [
      {
        "name": "_exchange",
        "type": "address"
      },
      {
        "name": "_wyre",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
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
        "name": "salt",
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


const fillOrderAsync = (web3, signedOrder, takerAddress) => {
  return new Promise(async (resolve, reject) => {
    const filterContractInstance = new web3.eth.Contract(FILTER_ABI, config.filterContractAddress);
    
    const order = {
      makerAddress: signedOrder.makerAddress,
      takerAddress: signedOrder.takerAddress,
      feeRecipientAddress: signedOrder.feeRecipientAddress,
      senderAddress: signedOrder.senderAddress,
      makerAssetAmount: ethers.utils.bigNumberify(signedOrder.makerAssetAmount.toString()),
      takerAssetAmount: ethers.utils.bigNumberify(signedOrder.takerAssetAmount.toString()),
      makerFee: signedOrder.makerFee,
      takerFee: signedOrder.takerFee,
      expirationTimeSeconds: ethers.utils.bigNumberify(signedOrder.expirationTimeSeconds.toString()),
      salt: signedOrder.salt,
      makerAssetData: signedOrder.makerAssetData,
      takerAssetData: signedOrder.takerAssetData
    };

    console.log("order = ", order);
    
    const salt = generatePseudoRandomSalt();

    const txHash = await filterContractInstance.methods.conditionalFillOrder(
      order, order.takerAssetAmount, ethers.utils.bigNumberify(salt.toString()), signedOrder.signature).send({ from: takerAddress, gas: 5000000 });
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
    console.log('before accounts');
    const accounts = await web3Wrapper.getAvailableAddressesAsync();
    console.log('accounts', accounts);
    const takerAddress = accounts[0];

    // Allowance
    /*const takerTokenAddress = assetDataUtils.decodeERC20AssetData(order.takerAssetData).tokenAddress;
    const setTakerAllowTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(takerTokenAddress, takerAddress);
    await web3Wrapper.awaitTransactionSuccessAsync(setTakerAllowTxHash);
    console.log('takerAddress allowance mined...');*/

    // Validator approval
    const validatorApprovalTxHash = await contractWrappers.exchange.setSignatureValidatorApprovalAsync(
      config.filterContractAddress, true, takerAddress,
      {
        gasLimit: 5000000
      });
    await web3Wrapper.awaitTransactionSuccessAsync(validatorApprovalTxHash);
    console.log('Validator Approval Mined');

    // Filling order
    //const txHash = await fillOrderAsync(web3, order, takerAddress);
    
    /* const txHash = await contractWrappers.exchange.fillOrderAsync(order, order.takerAssetAmount, takerAddress, {
      gasLimit: 5000000,
    });*/
    await web3Wrapper.awaitTransactionSuccessAsync(txHash);
    console.log('Fill Order Mined');

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
        mutation: UPDATE_ORDER_VALID,
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

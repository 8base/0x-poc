// External libraries
import React, { Component } from "react";
import { Button, Col, ControlLabel, Form, FormControl, FormGroup, Radio, Tabs, Tab } from "react-bootstrap";
import { BigNumber } from '@0xproject/utils';
import { assetDataUtils, contractWrappers, generatePseudoRandomSalt } from '0x.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

// Components
import config from '../../config';
import Loading from "../Loading/Loading";
import TimeUnitSelect from "./TimeUnitSelect/TimeUnitSelect";
import TokenPairSelect from "./TokenPairSelect/TokenPairSelect";
import ERC20Form from "./Forms/ERC20Form";
import DharmaForm from "./Forms/DharmaForm";


// 0x
import getZeroEx from '../../services/getZeroEx';

// Styling
import "./CreateOrder.css";

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

class CreateOrder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orderDirection: "Buy",
      amount: 0,
      price: 0,
      tokenPairId: "1"
    };

    this.handleInputChange = this.handleInputChange.bind(this);    
    this.CreateOrderERC20 = this.CreateOrderERC20.bind(this);
    this.CreateOrderDharma = this.CreateOrderDharma.bind(this);
  }

  getTokenPairById = (tokenPairId) => {
    const { tokenPairs } = this.props;
    return tokenPairs.find((tokenPair) => {
      return tokenPair.id == tokenPairId;
    });
  }

  async CreateOrderERC20(event) {
    event.preventDefault();
    // orderDirection, amount, price, tokenPairId
    // console.log('CreateOrder', event.target.elements.orderDirection.value);  
    const orderDirection = event.target.elements.orderDirection.value;
    const amount = event.target.elements.amount.value;
    const price = event.target.elements.price.value;
    const tokenPairId = event.target.elements.tokenPairId.value;

    const { handleCreateOrder, onCompletion, tokenPairs } = this.props;    
    const { contractWrappers, web3Wrapper } = await getZeroEx;    
    const accounts = await web3Wrapper.getAvailableAddressesAsync();    
    const makerAddress = accounts[0];
    console.log('makerAddress', makerAddress);
    const tokenPair = this.getTokenPairById(tokenPairId);

    let makerTokenAddress, takerTokenAddress, makerAssetData, takerAssetData, makerAssetAmount, takerAssetAmount;

    // Buy
    if (orderDirection == 'Buy') {
      console.log('Buy');
      makerTokenAddress = tokenPair.tokenA.address;
      takerTokenAddress = tokenPair.tokenB.address;
      makerAssetData = assetDataUtils.encodeERC20AssetData(makerTokenAddress);      
      takerAssetData = assetDataUtils.encodeERC20AssetData(takerTokenAddress);
      makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber((amount * price).toString().substring(0,12)), tokenPair.tokenA.decimals);
      takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(amount), tokenPair.tokenB.decimals);
    }

    // Sell
    if (orderDirection == 'Sell') {
      console.log('Sell');
      makerTokenAddress = tokenPair.tokenB.address;
      takerTokenAddress = tokenPair.tokenA.address;
      makerAssetData = assetDataUtils.encodeERC20AssetData(makerTokenAddress);
      takerAssetData = assetDataUtils.encodeERC20AssetData(takerTokenAddress);
      makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(amount), tokenPair.tokenB.decimals);
      takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber((amount * price).toString().substring(0,12)), tokenPair.tokenA.decimals);
    }
    
    /*const setMakerAllowTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(makerTokenAddress, makerAddress);
    await web3Wrapper.awaitTransactionSuccessAsync(setMakerAllowTxHash);
    console.log('makerAddress allowance mined...');*/

    try {
      const orderHash = await handleCreateOrder({
        makerAddress: makerAddress,
        takerAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        makerAssetData,
        takerAssetData,
        senderAddress: config.filterContractAddress,
        exchangeAddress: contractWrappers.exchange.getContractAddress(),
        salt: generatePseudoRandomSalt(),
        makerFee: new BigNumber(0),
        takerFee: new BigNumber(0),
        makerAssetAmount,
        takerAssetAmount,
        expirationTimeSeconds: new BigNumber(Date.now() + 3600000), // Valid for up to an hour
        isBuy: orderDirection == 'Buy'
      });
      onCompletion(orderHash);
    } catch (e) {
      console.error(e);
    }
  }

  async CreateOrderDharma(event) {
    event.preventDefault();
    // orderDirection, amount, price, tokenPairId
    // console.log('CreateOrder', event.target.elements.orderDirection.value);  
    const tokenId = event.target.elements.tokenId.value;    
    const price = event.target.elements.price.value;    

    const { handleCreateOrder, onCompletion, tokenPairs } = this.props;    
    const { contractWrappers, web3Wrapper } = await getZeroEx;    
    const accounts = await web3Wrapper.getAvailableAddressesAsync();    
    const makerAddress = accounts[0];
    console.log('makerAddress', makerAddress);
    const WETH_ADDRESS = contractWrappers.etherToken.getContractAddressIfExists();    

    let makerTokenAddress, makerAssetData, takerAssetData, makerAssetAmount, takerAssetAmount;
    
    console.log('ERC721', config.dharmaDebtToken, tokenId);
    makerAssetData = assetDataUtils.encodeERC721AssetData(config.dharmaDebtToken, new BigNumber(tokenId));      
    takerAssetData = assetDataUtils.encodeERC20AssetData(WETH_ADDRESS);
    makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(1), 18);
    takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(price), 18);
  
    
    /*const setMakerAllowTxHash = await contractWrappers.erc721Token.setProxyApprovalAsync(config.dharmaDebtToken, new BigNumber(tokenId));
    await web3Wrapper.awaitTransactionSuccessAsync(setMakerAllowTxHash);
    console.log('makerAddress allowance mined...');*/

    try {
      const orderHash = await handleCreateOrder({
        makerAddress: makerAddress,
        takerAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        makerAssetData,
        takerAssetData,
        senderAddress: config.filterContractAddress,
        exchangeAddress: contractWrappers.exchange.getContractAddress(),
        salt: generatePseudoRandomSalt(),
        makerFee: new BigNumber(0),
        takerFee: new BigNumber(0),
        makerAssetAmount,
        takerAssetAmount,
        expirationTimeSeconds: new BigNumber(Date.now() + 3600000), // Valid for up to an hour
        isBuy: false
      });
      onCompletion(orderHash);
    } catch (e) {
      console.error(e);
    }
  }  

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    
    this.setState({
      [name]: value,
    });
  }

  render() {
    const { tokenPairs } = this.props;    

    if (tokenPairs.length === 0) {
      return <Loading />;
    }    

    const {
      orderDirection,
      amount,
      price,
      tokenPairId
    } = this.state;    

    const labelWidth = 3;
    const dropdownWidth = 3;
    const inputWidth = 6;

    return (
      <Col md={6}>
        <Tabs id="form-selector">          
          <Tab eventKey={1} title="ERC20"><ERC20Form tokenPairs={tokenPairs} handleSubmit={this.CreateOrderERC20} /></Tab>
          <Tab eventKey={2} title="Dharma"><DharmaForm handleSubmit={this.CreateOrderDharma} /></Tab>
        </Tabs>
        
      </Col>
    );
  }
}

export default CreateOrder;

// External libraries
import React, { Component } from "react";
import { Button, Col, ControlLabel, Form, FormControl, FormGroup, Radio } from "react-bootstrap";
import { BigNumber } from '@0xproject/utils';
import { assetDataUtils, contractWrappers, generatePseudoRandomSalt } from '0x.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

// Components
import config from '../../config';
import Loading from "../Loading/Loading";
import TimeUnitSelect from "./TimeUnitSelect/TimeUnitSelect";
import TokenPairSelect from "./TokenPairSelect/TokenPairSelect";

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
    this.getTokenPairById = this.getTokenPairById.bind(this);
    this.CreateOrder = this.CreateOrder.bind(this);
  }

  async CreateOrder(event) {
    event.preventDefault();    

    const { handleCreateOrder, onCompletion, tokenPairs } = this.props;
    const { orderDirection, amount, price, tokenPairId } = this.state;
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
      makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber((amount * price).toString()), tokenPair.tokenA.decimals);
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
      takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber((amount * price).toString()), tokenPair.tokenA.decimals);
    }
    
    const setMakerAllowTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(makerTokenAddress, makerAddress);
    await web3Wrapper.awaitTransactionSuccessAsync(setMakerAllowTxHash);
    console.log('makerAddress allowance mined...');

    try {
      const id = await handleCreateOrder({
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
      onCompletion(id);
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

  getTokenPairById(tokenPairId) {
    const { tokenPairs } = this.props;
    return tokenPairs.find((tokenPair) => {
      return tokenPair.id == tokenPairId;
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

    const tokenPair = this.getTokenPairById(tokenPairId);

    const labelWidth = 3;
    const dropdownWidth = 3;
    const inputWidth = 6;

    return (
      <Col md={6}>
        <Form horizontal onSubmit={this.CreateOrder}>

          <FormGroup controlId="tokenPair">
            <Col componentClass={ControlLabel} sm={labelWidth}>
              Token Pair
            </Col>
            <Col sm={inputWidth}>
              <TokenPairSelect
                name="tokenPairId"
                onChange={this.handleInputChange}
                defaultValue={tokenPairId}
                tokenPairs={tokenPairs}
              />
            </Col>
          </FormGroup>

          <FormGroup controlId="orderDirection" onChange={this.handleInputChange}>
            <Col componentClass={ControlLabel} sm={labelWidth}>
              Order Direction
            </Col>
            <Col sm={inputWidth}>
              <Radio name="orderDirection" defaultChecked={orderDirection == 'Buy'} inline  value="Buy">Buy</Radio>{' '}
              <Radio name="orderDirection" defaultChecked={orderDirection == 'Sell'} inline value="Sell">Sell</Radio>{' '}
            </Col>
          </FormGroup>

          <FormGroup controlId="amount">
            <Col componentClass={ControlLabel} sm={labelWidth}>
              Amount ({tokenPair.tokenB.symbol})
            </Col>
            <Col sm={inputWidth}>
              <FormControl
                onChange={this.handleInputChange}
                type="number"
                placeholder="Amount"
                name="amount"
                value={amount}
              />
            </Col>
          </FormGroup>

          <FormGroup controlId="price">
            <Col componentClass={ControlLabel} sm={labelWidth}>
              Price ({tokenPair.tokenA.symbol})
            </Col>
            <Col sm={inputWidth}>
              <FormControl
                onChange={this.handleInputChange}
                type="number"
                name="price"
                placeholder="Price"
                value={price}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col smOffset={labelWidth} sm={10}>
              <Button type="submit" bsStyle="primary">
                Create
              </Button>
            </Col>
          </FormGroup>
        </Form>
      </Col>
    );
  }
}

export default CreateOrder;

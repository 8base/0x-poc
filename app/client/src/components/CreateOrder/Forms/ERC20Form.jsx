import React, { Component } from "react";
import { Button, Col, ControlLabel, Form, FormControl, FormGroup, Radio, Tabs, Tab } from "react-bootstrap";

import { dropdownWidth, inputWidth, labelWidth } from './constants';
import TimeUnitSelect from "../TimeUnitSelect/TimeUnitSelect";
import TokenPairSelect from "../TokenPairSelect/TokenPairSelect";


class ERC20Form extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      orderDirection: "Buy",
      amount: 0,
      price: 0,
      tokenPairId: "1"
    };

    this.handleInputChange = this.handleInputChange.bind(this);    
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  getTokenPairById = (tokenPairId) => {
    const { tokenPairs } = this.props;
    return tokenPairs.find((tokenPair) => {
      return tokenPair.id == tokenPairId;
    });
  }

  render() {

    const { tokenPairs, handleSubmit } = this.props;
    const { orderDirection, amount, price, tokenPairId } = this.state;

    const tokenPair = this.getTokenPairById(tokenPairId);

    return (
      <Form horizontal onSubmit={handleSubmit}>
        <br />
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
            <Radio name="orderDirection" defaultChecked={orderDirection == 'Buy'} inline value="Buy">Buy</Radio>{' '}
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
    );
  }
}

export default ERC20Form;
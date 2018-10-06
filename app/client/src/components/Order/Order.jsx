import React, { Component } from "react";
import * as moment from "moment";

import { displayBigIntWithPrecision } from "../../utils";
import TransactionManager from "../TransactionManager/TransactionManager";
import Actions from "./Actions/Actions";
import Loading from "../Loading/Loading";

import "./Order.css";

import { LinkContainer } from "react-router-bootstrap";

import { Breadcrumb, Panel } from "react-bootstrap";

class Order extends Component {
  constructor(props) {
    super(props);

    this.handleFill = this.handleFill.bind(this);
  }

  handleFill() {
    const { fillOrder } = this.props;

    (async () => {
      await fillOrder();
    })();
  }

  render() {
    const { order, transactions, web3Wrapper } = this.props;    

    if (!order) {
      return <Loading />;
    }

    const amount = order.isBuy ? order.takerAssetAmount : order.makerAssetAmount;
    const amountSymbol = order.isBuy ? order.takerAssetMetadata.symbol : order.makerAssetMetadata.symbol;
    const total = order.isBuy ? order.takerAssetAmount.mul(order.price) : order.makerAssetAmount.mul(order.price);
    const totalSymbol = order.isBuy ? order.makerAssetMetadata.symbol : order.takerAssetMetadata.symbol;

    return (
      <div>
        <Breadcrumb>
          <LinkContainer to="/" exact={true}>
            <Breadcrumb.Item href="#">&lsaquo; All Orders</Breadcrumb.Item>
          </LinkContainer>

          <Breadcrumb.Item active>Details</Breadcrumb.Item>
        </Breadcrumb>

        {transactions.map((transaction) => {
          const { txHash, description } = transaction;

          return (
            <TransactionManager
              key={txHash}
              txHash={txHash}
              web3Wrapper={web3Wrapper}
              description={description}
              onSuccess={this.reloadState}
            />
          );
        })}

        <Panel bsStyle="primary">
          <Panel.Heading>
            <Panel.Title componentClass="h3">{order.isBuy ? 'Buy ' : 'Sell '} Order</Panel.Title>
          </Panel.Heading>
          <Panel.Body>
            <div>
              <dl className="row">
                <dt className="col-sm-3">Amount</dt>
                <dd className="col-sm-9">
                  {`${displayBigIntWithPrecision(amount)} ${amountSymbol}`}
                </dd>

                <dt className="col-sm-3">Price</dt>
                <dd className="col-sm-9">
                  {`${order.price}`}
                </dd>

                <dt className="col-sm-3">Total</dt>
                <dd className="col-sm-9">{`${displayBigIntWithPrecision(total)} ${totalSymbol}`}</dd>

                <dt className="col-sm-3">Expires</dt>
                <dd className="col-sm-9">{moment.unix(order.expirationTimeSeconds / 1000).format("MMMM Do YYYY, h:mm:ss a")}</dd>

                <dt className="col-sm-3">Address</dt>
                <dd className="col-sm-9">
                  <a
                    href={`https://etherscan.io/address/${order.maker}`}
                    target="_blank">
                    {order.maker}
                  </a>
                </dd>
              </dl>
            </div>
          </Panel.Body>
          <Panel.Footer>
            <Actions
              onFill={this.handleFill}
            />
          </Panel.Footer>
        </Panel>
      </div>
    );
  }
}

export default Order;

// External libraries
import * as moment from "moment";
import React, { Component } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import { Button } from "react-bootstrap";

import { displayBigInt, displayBigIntWithPrecision } from "../../utils";

// Components
import Loading from "../Loading/Loading";

// Styling
import "./Orderbook.css";

/**
 * Here we define the columns that appear in the table that holds all of the
 * open Loan Requests.
 */
const columns = [
  {
    dataField: "makerAssetAmount",
    text: "Maker Token Amount",
  },
  {
    dataField: "takerAssetAmount",
    text: "Taker Token Amount",
  },
  {
    dataField: "price",
    text: "Price",
  }
];

class Orderbook extends Component {
  constructor(props) {
    super(props);

    this.state = {
      highlightRow: null,
    };
  }

  /**
   * When the component mounts, use the API to get all of the load requests from the relayer
   * database, and parse those into LoanRequest objects using Dharma.js. Then, set the state of
   * the current component to include those loan requests so that they can be rendered as a table.
   *
   * This function assumes that there is a database with Loan Request data, and that we have
   * access to Dharma.js, which is connected to a blockchain.
   */
  componentDidMount() {
    const { highlightRow } = this.props;

    this.setState({
      highlightRow,
    });
  }

  displayOrder = (order) => {
    return {
      ...order,
      price: displayBigInt(order.price),
      makerAssetAmount: `${displayBigIntWithPrecision(order.makerAssetAmount)} ${order.makerAssetMetadata.symbol}`,
      takerAssetAmount: `${displayBigIntWithPrecision(order.takerAssetAmount)} ${order.takerAssetMetadata.symbol}`,
    };
  }

  getData = () => {
    const { orderbook } = this.props;

    return {
      bids: orderbook.bids.map(this.displayOrder),
      asks: orderbook.asks.map(this.displayOrder)
    }
  }

  render() {
    const { highlightRow } = this.state;
    const { isLoading } = this.props;

    const data = this.getData();
    console.log('data', data);

    if (isLoading) {
      return <Loading />;
    }

    const rowEvents = {
      onClick: (e, row, rowIndex) => {
        this.props.redirect(`/order/${row.hash}`);
      },
    };

    const rowClasses = (row, rowIndex) => {
      return "loan-request-row";
    };

    return (
      <div>
        <h1>ZRX /w ETH</h1>
        <div>
          <div>Asks:</div>
          <BootstrapTable
            hover={true}
            keyField="id"
            columns={columns}
            data={data.asks}
            rowEvents={rowEvents}
            rowClasses={rowClasses}
          />
        </div>
        <div>
          <div>Bids:</div>
          <BootstrapTable
            hover={true}
            keyField="id"
            columns={columns}
            data={data.bids}
            rowEvents={rowEvents}
            rowClasses={rowClasses}
          />
        </div>
      </div>
    );
  }
}

export default Orderbook;

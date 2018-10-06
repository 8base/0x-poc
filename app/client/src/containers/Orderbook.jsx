// External libraries
import React, { Component } from "react";
import { assetDataUtils } from '0x.js';

// Components
import Orderbook from "../components/Orderbook/Orderbook";

// Helpers
import OrderbookLoader from "../services/OrderbookLoader";

class OrderbookContainer extends Component {
    constructor(props) {
        super(props);

        this.redirect = this.redirect.bind(this);
        this.parseQueryParams = this.parseQueryParams.bind(this);
    }

    redirect(location) {
        this.props.history.push(location);
    }

    /**
     * Returns the id of the LoanRequest that should be highlighted.
     *
     * @returns {number||null}
     */
    parseQueryParams() {
        const search = this.props.location.search;
        const params = new URLSearchParams(search);
        const rowToHighlight = params.get("highlightRow");
        const baseAssetData = params.get("baseAssetData"); 
        const quoteAssetData = params.get("quoteAssetData"); 

        return {
          rowToHighlight: rowToHighlight ? parseInt(rowToHighlight, 10) : null,
          baseAssetData,
          quoteAssetData
        };
    }

    render() {
        const { highlightRow } = this.parseQueryParams();

        // Hardcoding for now
        const baseAssetData = assetDataUtils.encodeERC20AssetData("0x2002d3812f58e35f0ea1ffbf80a75a38c32175fa");
        const quoteAssetData = assetDataUtils.encodeERC20AssetData("0xd0a1e359811322d97991e03f863a0c30c2cf029c");

        return (
            <OrderbookLoader baseAssetData={ baseAssetData } quoteAssetData={ quoteAssetData } >
                {({ orderbook, isLoading }) => (
                    <Orderbook 
                        highlightRow={highlightRow}
                        redirect={this.redirect}
                        isLoading={isLoading}
                        orderbook={orderbook}                        
                    />
                )}
            </OrderbookLoader>
        );
    }
}

export default OrderbookContainer;

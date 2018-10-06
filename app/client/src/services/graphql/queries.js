import gql from "graphql-tag";


export const ORDERBOOK = gql`query orderbook($baseAssetData: String, $quoteAssetData: String, $skip: Int, $first: Int, $last: Int) {
  bids: ordersList(filter: {
    AND: [{
      makerAssetData: {
        equals: $quoteAssetData
      },
      takerAssetData: {
        equals: $baseAssetData
      },      
      isValid: {
        equals: true
      }      
    }]
  }, orderBy: [price_DESC], skip: $skip, first: $first, last: $last) {
    exchangeAddress
    makerAddress
    takerAddress
    makerAssetData
    takerAssetData
    feeRecipientAddress
    makerAssetAmount
    takerAssetAmount
    makerFee
    takerFee
    expirationTimeSeconds
    salt
    signature
    price
    hash
    id
    isBuy
  }

  asks: ordersList(filter: {
    AND: [{
      makerAssetData: {
        equals: $baseAssetData
      },
      takerAssetData: {
        equals: $quoteAssetData
      },
      isValid: {
        equals: true
      }
    }]
  }, orderBy: [price_DESC], skip: $skip, first: $first, last: $last) {
    exchangeAddress
    makerAddress
    takerAddress
    makerAssetData
    takerAssetData
    feeRecipientAddress
    makerAssetAmount
    takerAssetAmount
    makerFee
    takerFee
    expirationTimeSeconds
    salt
    signature
    price
    hash
    id
    isBuy
  }  
}
`;

export const ORDER_BY_HASH = gql`
  query ordersList($hash: String!){
    ordersList(filter: {
      hash: {
        equals: $hash
      }
    }, first: 1) {
      exchangeAddress
      makerAddress
      takerAddress
      makerAssetData
      takerAssetData
      feeRecipientAddress
      makerAssetAmount
      takerAssetAmount
      makerFee
      takerFee
      expirationTimeSeconds
      salt
      signature
      price
      hash
      id
      isBuy
    }
  }
`;


export const TOKEN_PAIRS = gql`
query tokenPairsList {
  tokenPairsList {
    id
    tokenA {
      address
      precision
    }
  }
}
`;
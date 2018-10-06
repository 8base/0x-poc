import gql from "graphql-tag";


export const ORDER = gql`subscription Orders($filter: OrderFilter) {
  Orders(filter: {
    mutation_in: [
      create, update
    ],
    node: $filter
  }) {
    node {
      exchangeAddress
      maker
      taker
      makerAssetData
      takerAssetData
      feeRecipient
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
    }
    mutation
  }
}`;


// Temporary fix for PoC
export const ORDER_1 = gql`subscription Orders {
  Orders(filter: {
    mutation_in: [
      create, update
    ],
    node: {
      exchangeAddress: {
        equals: "0x35dD2932454449b14Cee11A94d3674a936d5d7b2"
      } 
    }
  }) {
    node {
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
    mutation
  }
}`;

export const ORDER_STATE_1 = gql`
subscription OrderState {
  OrderState(filter:{
    mutation_in: [create, update],
    node: {
      order:{
        exchangeAddress: {
          equals: "0x48bacb9266a570d521063ef5dd96e61686dbe788"
        } 
      }
    }
  }) {
    mutation
    node {
      id
      makerBalance
      makerProxyAllowance
      makerFeeBalance
      makerFeeProxyAllowance
      filledtakerAssetAmount
      cancelledtakerAssetAmount
      remainingFillablemakerAssetAmount
      remainingFillabletakerAssetAmount
      isValid
      order {
        id
      }
    }
  }
}
`;
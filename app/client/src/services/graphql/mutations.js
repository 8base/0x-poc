import gql from "graphql-tag";

export const ORDER_CREATE = gql`
  mutation orderCreate($data: OrderCreateInput){
    orderCreate(data: $data) {
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
      senderAddress
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

export const UPDATE_ORDER_STATE = gql`mutation orderStateUpdate($id: ID!, $isValid: Boolean) {
orderStateUpdate(data: {
  id: $id,  
  isValid: $isValid
}) {
  id
}
}
`;

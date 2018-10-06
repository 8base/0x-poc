import gql from "graphql-tag";

const ORDERS_BY_HASH = gql`query ordersList($hash: String) {
  ordersList(filter: {
    hash: {
      equals: $hash
    }
  }, first: 1) {
    exchangeContractAddress
    maker
    taker
    makerTokenAddress
    takerTokenAddress
    feeRecipient
    makerTokenAmount
    takerTokenAmount
    makerFee
    takerFee
    expirationUnixTimestampSec
    salt
    ecSignature
  }
}
`;

export default async (event: any, context: any) => {
  console.log('event', event);
  let queryStringParameters = event.args.queryStringParameters || {};  
  const { hash } = queryStringParameters;
  

  const { ordersList } = await context.api.gqlRequest(ORDERS_BY_HASH, { hash });
  let order = null;
  if (ordersList.length >= 1) {
    order = ordersList[0];
  }

  return {
    statusCode: 200,
    body: JSON.stringify(order)
  };
};

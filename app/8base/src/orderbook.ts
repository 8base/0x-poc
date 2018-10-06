import gql from "graphql-tag";

const ORDERBOOK = gql`query orderbook($baseTokenAddress: String, $quoteTokenAddress: String, $skip: Int, $first: Int, $last: Int) {
  bids: ordersList(filter: {
    AND: [{
      makerTokenAddress: {
        equals: $quoteTokenAddress
      },
      takerTokenAddress: {
        equals: $baseTokenAddress
      }
    }]
  }, orderBy: [price_DESC], skip: $skip, first: $first, last: $last) {
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

  asks: ordersList(filter: {
    AND: [{
      makerTokenAddress: {
        equals: $baseTokenAddress
      },
      takerTokenAddress: {
        equals: $quoteTokenAddress
      }
    }]
  }, orderBy: [price_ASC], skip: $skip, first: $first, last: $last) {
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
  const queryStringParameters = event.args.queryStringParameters || {};    
  let { 
    baseTokenAddress, // [string]: address of token designated as the baseToken in the currency pair calculation of price 
    quoteTokenAddress, // [string]: address of token designated as the quoteToken in the currency pair calculation of price
    page, per_page
  } = queryStringParameters;
  

  // Limit page to 100 records and start with page 1
  per_page = per_page > 0 ? per_page: 100;
  page = page > 0 ? page : 1;

  let variables = {
    baseTokenAddress: baseTokenAddress || "",
    quoteTokenAddress: quoteTokenAddress || "",    
    first: per_page,
    ...(page > 1) && { skip: per_page * (page - 1) }
  };

  const orderbook = await context.api.gqlRequest(ORDERBOOK, variables);  

  return {
    statusCode: 200,
    body: JSON.stringify(orderbook)
  };
};

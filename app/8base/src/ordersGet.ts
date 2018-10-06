import gql from "graphql-tag";

const ORDERS_LIST = gql`query ordersList($filter: OrderFilter, $orderBy: [OrderOrderBy], $skip: Int, $first: Int, $last: Int) {
  ordersList(filter: $filter, orderBy: $orderBy, skip: $skip, first: $first, last: $last) {
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
  let queryStringParameters = event.args.queryStringParameters || {};    
  let { 
    exchangeContractAddress, // [string]: returns orders created for this exchange address
    tokenAddress, // [string]: returns orders where makerTokenAddress or takerTokenAddress is token address
    makerTokenAddress, // [string]: returns orders with specified makerTokenAddress
    takerTokenAddress, // [string]: returns orders with specified makerTokenAddress
    maker, // [string]: returns orders where maker is maker address
    taker, // [string]: returns orders where taker is taker address
    trader, // [string]: returns orders where maker or taker is trader address
    feeRecipient, // [string]: returns orders where feeRecipient is feeRecipient address
    page, per_page
  } = queryStringParameters;
  

  // Limit page to 100 records and start with page 1
  per_page = per_page > 0 ? per_page: 100;
  page = page > 0 ? page : 1;

  
  const filters = [];

  if (exchangeContractAddress) {
    filters.push({ 
      exchangeContractAddress: {
        equals: exchangeContractAddress
      }      
    });
  }

  if (tokenAddress) {
    filters.push({
      OR: [{
        makerTokenAddress: {
          equals: tokenAddress
        }
      },
      {
        takerTokenAddress: {
          equals: tokenAddress
        }
      }]
    });    
  }

  if (makerTokenAddress) {
    filters.push({ 
      makerTokenAddress: {
        equals: makerTokenAddress
      }      
    });    
  }

  if (takerTokenAddress) {
    filters.push({ 
      takerTokenAddress: {
        equals: takerTokenAddress
      }      
    });        
  }

  if (maker) {
    filters.push({ 
      maker: {
        equals: maker
      }      
    });    
  }

  if (taker) {
    filters.push({ 
      taker: {
        equals: taker
      }      
    }); 
  }

  if (trader) {
    filters.push({
      OR: [{
        maker: {
          equals: trader
        }
      },
      {
        taker: {
          equals: trader
        }
      }]
    });
  }  

  if (feeRecipient) {
    filters.push({ 
      feeRecipient: {
        equals: feeRecipient
      }      
    });    
  }

  let orderBy = null;
  if (makerTokenAddress && takerTokenAddress) {
    orderBy = ["price_ASC"];
  }

  let variables = {
    ...(filters.length > 0) && { filter: { AND: filters } },
    ...orderBy && { orderBy },
    first: per_page,
    ...(page > 1) && { skip: per_page * (page - 1) }
  };

  const { ordersList } = await context.api.gqlRequest(ORDERS_LIST, variables);  

  return {
    statusCode: 200,
    body: JSON.stringify(ordersList)
  };
};

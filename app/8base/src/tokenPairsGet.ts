import gql from "graphql-tag";

const TOKEN_PAIRS_LIST = gql`query tokenPairsList($filter: TokenPairFilter, $skip: Int, $first: Int, $last: Int) {
  tokenPairsList(filter: $filter, skip: $skip, first: $first, last: $last) {
    tokenA {
      address,
      minAmount,
      maxAmount,
      precision
    }
    tokenB {
      address,
      minAmount,
      maxAmount,
      precision      
    }
  }
}
`;

export default async (event: any, context: any) => {    
  const queryStringParameters = event.args.queryStringParameters || {};    
  let { tokenA, tokenB, page, per_page } = queryStringParameters;  

  // Limit page to 100 records and start with page 1
  per_page = per_page > 0 ? per_page: 100;
  page = page > 0 ? page : 1;

  let filter = null;

  if (tokenA) {
    filter = {
      ...filter,
      tokenA: {
        address: {
          equals: tokenA
        }
      }
    }
  }

  if (tokenB) {
    filter = {
      ...filter,
      tokenB: {
        address: {
          equals: tokenB
        }
      }
    }    
  }

  let variables = {
    ...filter && { filter },
    first: per_page,
    ...(page > 1) && { skip: per_page * (page - 1) }
  };

  const { tokenPairsList } = await context.api.gqlRequest(TOKEN_PAIRS_LIST, variables);  

  return {
    statusCode: 200,
    body: JSON.stringify(tokenPairsList)
  };
};

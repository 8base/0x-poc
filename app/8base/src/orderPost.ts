import gql from "graphql-tag";

const ORDERS_CREATE = gql`mutation orderCreate($data: OrderCreateInput){
  orderCreate(data: $data) {
    id
  }
}
`;

export default async (event: any, context: any) => {
  const orderData = JSON.parse(event.args.body);
  const result = await context.api.gqlRequest(ORDERS_CREATE, { data: orderData });
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};

import * as request from 'request-promise-native';

const ORDER_WATCHER_URL = 'http://dfb8316d.ngrok.io';

export default async (event: any, context: any) => {
  const order = event.tableActionResult.dbModel;  

  console.log('order', order);

  const requestOptions = {
    method: 'POST',
    uri: `${ORDER_WATCHER_URL}/order/add`,
    body: {
        ...order
    },
    json: true // Automatically stringifies the body to JSON
  };
  const result = await request(requestOptions);
  console.log('OrderWatcher add result', result);

  return {
    ...order
  }
}
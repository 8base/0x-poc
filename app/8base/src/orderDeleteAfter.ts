import * as request from 'request-promise-native';

const ORDER_WATCHER_URL = 'http://dfb8316d.ngrok.io';

export default async (event: any, context: any) => {
  console.log('event', event);
  const order = event.tableActionResult.dbModel;  

  console.log('order', order);

  const requestOptions = {
    method: 'POST',
    uri: `${ORDER_WATCHER_URL}/order/remove`,
    body: order.hash
  };
  const result = await request(requestOptions);
  console.log('OrderWatcher remove result', result);

  return {
    ...order
  }
}
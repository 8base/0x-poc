const { BigNumber, orderHashUtils } = require('0x.js');
const Web3 = require('web3');

//const FILTER_ADDRESS = '0x77190f37303bea47fc61c9d3a94412d97e7fabe0';
//const WYRE_TOKEN_ADDRESS = '0xB14fA2276D8bD26713A6D98871b2d63Da9eefE6f';
const WYRE_ABI = JSON.parse('[{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_approved","type":"address"},{"indexed":false,"name":"_tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"takeOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"approvedFor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"tokensOf","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]');

const web3 = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/9073e2cc18a3423d80019b6af0dee2dc"));

const verifyAddress = (address) => {
  return new Promise((resolve, reject) => {
    const MyContract = web3.eth.contract(WYRE_ABI);
    const myContractInstance = MyContract.at(process.env.WYRE_TOKEN_ADDRESS);
    myContractInstance.balanceOf.call(address, (error, balance) => {
      if (error) {
        console.log('err--->', error);
        return reject(error);
      }
      console.log(' balance--->', balance.c[0]);
      return resolve(balance.c[0] >= 1);
    });
  });
}

export default async (event: any, context: any) => {
  console.log('event', event);

  const order = event.data;
  const orderHash = orderHashUtils.getOrderHashHex(order);
  const takerAssetAmount = new BigNumber(order.takerAssetAmount);
  const makerAssetAmount = new BigNumber(order.makerAssetAmount);
  const price = order.isBuy ? makerAssetAmount.dividedBy(takerAssetAmount).toPrecision(18) : takerAssetAmount.dividedBy(makerAssetAmount).toPrecision(18);

  // Check that `senderAddress` is set to our Filter contract
  if (order.senderAddress !== process.env.FILTER_ADDRESS) {
    throw new Error('Incorrect senderAdress. Rejecting order.');
  }

  // Verify maker address
  const verified = await verifyAddress(order.makerAddress);
  if (!verified) {
    throw new Error('makerAddress needs KYC verification. Rejecting order.');
  }

  return {
    data: {
      ...order,
      hash: orderHash,
      price,
      isValid: true
    }
  }
}
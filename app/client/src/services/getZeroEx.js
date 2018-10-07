import { ContractWrappers } from '0x.js';
import { RPCSubprovider, SignerSubprovider, Web3ProviderEngine } from '@0xproject/subproviders';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import * as Web3 from 'web3';

const TESTRPC_NETWORK_ID = 42;

export default new Promise((resolve) => {
  // Instantiate 0x.js instance
//  const provider = window.web3.currentProvider;
  if (window.web3 && window.web3.currentProvider) {
    const providerEngine = new Web3ProviderEngine();
    providerEngine.addProvider(new SignerSubprovider(window.web3.currentProvider));  
    providerEngine.addProvider(new RPCSubprovider('https://kovan.infura.io/v3/9073e2cc18a3423d80019b6af0dee2dc'));
    providerEngine.start();
  
    const contractWrappers = new ContractWrappers(providerEngine, { networkId: TESTRPC_NETWORK_ID });
    const web3Wrapper = new Web3Wrapper(providerEngine);
  
  
    const web3 = new Web3(providerEngine);
    resolve({ contractWrappers, providerEngine: providerEngine, web3Wrapper, web3 });  
  }
})

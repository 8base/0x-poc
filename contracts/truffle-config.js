var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "concert load couple harbor equip island argue ramp clarify fence smart topic";

/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

module.exports = {
  networks: {
    kovan: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://kovan.infura.io/v3/9073e2cc18a3423d80019b6af0dee2dc")
      },
      network_id: 42,
      gas: 3000000,
      gasPrice: 21      
    }   
  }
};

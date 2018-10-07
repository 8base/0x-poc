var WyreFilter = artifacts.require("WyreFilter");


const EXCHANGE_ADDRESS = '0x35dd2932454449b14cee11a94d3674a936d5d7b2';
const WYRE_ADDRESS = '0xb14fa2276d8bd26713a6d98871b2d63da9eefe6f';

module.exports = function(deployer) {
    return deployer.deploy(WyreFilter, EXCHANGE_ADDRESS, WYRE_ADDRESS).then(function(r1) {
        console.log("WyreFilter deployed at", r1.address);
    });
};

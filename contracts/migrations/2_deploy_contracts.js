var WyreFilter = artifacts.require("WyreFilter");


module.exports = function(deployer) {
    return deployer.deploy(WyreFilter).then(function(r1) {
        console.log("WyreFilter deployed at", r1.address);        
    });
};

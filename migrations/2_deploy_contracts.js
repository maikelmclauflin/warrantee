var Warranty = artifacts.require("./Warranty.sol");
const uuidv4 = require('uuid/v4')

module.exports = function (deployer, network, accounts) {
  deployer.deploy(Warranty, {
    from: accounts[0]
  });
};

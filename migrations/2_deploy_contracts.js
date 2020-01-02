var Warrantee = artifacts.require("./Warrantee.sol");
const uuidv4 = require('uuid/v4')

module.exports = function (deployer, network, accounts) {
  deployer.deploy(Warrantee, {
    from: accounts[0]
  });
};

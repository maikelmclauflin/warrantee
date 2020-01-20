const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  package_name: "warrantee",
  version: "0.0.1",
  description: "Contract to track a linearly decaying warranty",
  dependencies: {
    "@openzeppelin/contracts": "2.4.0"
  },
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545,
      network_id: "*",
      host: "127.0.0.1",
      blockTime: 1,
      gas: 6721975,
      websockets: true
    },
    test: {
      port: 8545,
      network_id: "*",
      host: "127.0.0.1",
      blockTime: 1,
      gas: 6721975,
      websockets: true
    }
  },
  mocha: {
    useColors: true
  }
};

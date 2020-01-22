const Warranty = artifacts.require("./Warranty.sol")
const Dependencies = artifacts.require("./Dependencies.sol")
// const uuidv4 = require('uuid/v4')

module.exports = async function (deployer, network, accounts) {
  // await deployer.deploy(Dependencies)
  await deployer.link(Dependencies, Warranty)
  await deployer.deploy(Warranty, {
    from: accounts[0],
  })
}

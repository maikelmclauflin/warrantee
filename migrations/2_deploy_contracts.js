const Warranty = artifacts.require("./Warranty.sol")

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Warranty, {
    from: accounts[0],
  })
}

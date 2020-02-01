# Warrantee

a simple means to track warranty relationships between a warrantee and a warrantor.

### What does the contract do?

this contract and client code allows a pair of entities to setup a warranty relationship with one another. It exercises a decaying value payment to incentivize and facilitate the continued engagement between the two parties.

### Setup

* To setup, open at least two terminal windows.
* in the first, type 
```
ganache-cli -m="fruit immense dentist fruit pledge giant begin ski sibling ride vanish load"
```
* in the second run 
```
npm run reset-migrate
```
* if you would like to test the project before moving forward, run `npm t` to reset, migrate, and test!
* then cd into the client folder in the second terminal window `cd client` and run the following command
```
npm start
```
* you have now successfully started the project
* setup your metamask or web3 provider, and point it to the correct network, in this case `http://localhost:8545`
* visit `localhost:3000` and you have arrived!


The first thing you may notice is that there is both a business and a customer tab in the navigation. The customer "buys" claims and a business "guarantees" claims. In this particular case, the funds are not actually held in escrow, for the valuation of each claim that is created. This would easily run out of eth if it were ever to be deployed at scale and gain popularity. Instead, this contract can be thought of as a meta-repuation system. Or a singular data point that could be useful when painting a picture of an entity, such as a corporation. Not only, how much of their product have they sold, but how honorable has their warranty system been and are their warranties worth owning?

### library used

@openzepplin/contracts
  * token/ERC721/ERC721Metadata.sol
  * math/SafeMath.sol
  * math/Math.sol
  * utils/Address.sol
  * utils/ReentrancyGuard.sol
  * lifecycle/Pausable.sol

### Test comments 

are in the test file iteself (`test/warranty.js`)

### User Stories

product breaks + not reported -> nothing changes from real life. warranty expires
product not broken + not reported -> nothing changes from real life. warranty expires
product breaks + is reported -> business uses staked value and has to worry less about where to get funds since the amount that they accepted at the beginning already exists

1) trustworthy customer + trustworthy company
product not broken + reported (accidental? / stupid?) -> redemption can be reversed for small cost reputation of full cost to company taken into account by future warrantors.

2) non trustworthy customer + trustworthy company
product not broken + reported (wasting company's time?) -> redemption can be reversed for small cost reputation of full cost to company taken into account by future warrantors.

3) trustworthy customer + non trustworthy company
product broken + reported (company refuses to fulfill) -> historical data will show reports not matching up with obsolecence schedule fairly quickly / customers will go with higher payout company.

4) non trustworthy customer + non trustworthy compnay
collusion is expensive to do at scale. it is possible, but expensive. perhaps some sort of staking mechanism could be useful here something like what status has with their https://dap.ps/ app, which has highest ranked more easily able to lose votes.

### Future Work

With a few modifications a large amount of functionality could be added for erc20 tokens, as well as staking / escrow from both sides. Or, even cooler would be a new erc20 token (i know, i know, do we really need another?) that acts as a staking mechanism and burns tokens from the business side, while inflating them from the customer side? there's something interesting there.

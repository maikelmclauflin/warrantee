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
  * token/ERC721/ERC721Mintable.sol
  * math/SafeMath.sol
  * math/Math.sol
  * utils/Address.sol
  * utils/ReentrancyGuard.sol
  * lifecycle/Pausable.sol




## TODO 

* [ ] home / search
* [ ] browse w/ search page
* [ ] item detail page
    * [ ] details about item
    * [ ] add to cart
* [ ] cart / checkout page
    * [ ] emits event of purchases
    * [ ] prints the following keys
    * [ ] shipping contract

* [ ] internal use all products inventory page
* [ ] update item inventory page

# Decisions

a few decisions had to be made in the process of completing this project

### not everything can be trustless
  
it is often the case that there is not enough information for everyone to act rationally. However in this case, I think that giving entities enough incentive to do so by providing them with rewards in the form of eth and meta-repuation constitutes enough reason to keep acting rationally or get out of the game. To keep all of the funds in escrow would be insane. Any business could have billions of dollars under warranty at any given time. A fractional reserve of sort that is governed by statisical modeling. It is important to start with what is, in order to move toward what one might ideally like to see in the world. There is certainly room for escrow and requiring the full valuation be present in the warrantor's contract credit, but it was outside of the scope of this project.

### gas limitations

by grouping all of my contract extensions into a single subcontract to be extended once by the contract that I actually wanted to build upon, i was able to somehow use less gas than if i had done the extending and adding of methods in a single file / contract. This is why I have 2 contract files, but only one has tests, because the Dependencies file literally does nothing but extend other contracts.

### decaying refund value

by coding in a decaying refund, the contract gives the customer a reason to end the contract as quickly as possible to get as much eth back as they are able. A return policy, so to speak, where the risk to the repuation of the business is still justified by the eth earned. E.g, a 1 year warranty, that is active for 9 months, should still yield the company 3/4 of the value of securing the item, since that is the amount of work completed or risk borne by the entity to their repuation which is held on chain.

### easier to use safemath and trusted library

openzepplin is one of the most trusted solidity libraries in the world. the code is easy to use, straightforward, and well documented.

### react for front end

react is just what i know from a development point of view. avoiding a bunch of state / saga was very useful in this case since i didn't have to do much beyond listen for events / user transfers

### keeping resolution when computing decay

by first multiplying expiresAfter into the elapsed equation in the value, one is able to preserve the value of the work done by the business, instead of truncating it into a floor as a straight ratio would do.

### timestamp limitation

by limiting the expiration time to `100_000_000_000` seconds we are still at over 300 years, much longer than any person has ever been alive, longer than many countries, longer than most nations have stuck around, and certainly longer than any other bond or currency has existed, except physical instruments. I would say it is a fine place to start in order to allow for large value warranties to be created while the currency is still cheap and plentiful.

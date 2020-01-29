# Decisions

a few decisions had to be made in the process of completing this project

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

by limiting the expiration time to `1_000_000_000_000` seconds we are still at over 50,000 years, much longer than any person has ever been alive, longer than any countries, longer than nations have stuck around, and certainly longer than any other bond or currency has existed, except perhaps physical instruments. I would say it is a fine place to start in order to allow for large value warranties to be created while the currency is still cheap and plentiful.

### not everything can be trustless
  
It is often the case that there is not enough information for everyone to act rationally. However in this case, I think that giving entities enough incentive to do so by providing them with rewards in the form of eth and meta-repuation constitutes enough reason to keep acting rationally or get out of the game. To keep all of the funds in escrow would be insane. Any business could have billions of dollars under warranty at any given time. A fractional reserve of sort that is governed by statisical modeling. It is important to start with what is, in order to move toward what one might ideally like to see in the world. There is certainly room for escrow and requiring the full valuation be present in the warrantor's contract credit. To that effect, I am not sure that I have the game theory correct in this contract. It could probably be improved. Perhaps there is another way to express the relationship between a seller hedging risk against a product breaking with byzantine / arbitrary actors. Fractional staking seems like the right move, and using the blockchain as a proof of promise or proof of agreement (contract) seems more correct to me, at least as of right now.

### input, credit, and locked value

any value applied to a claim is set to a locked state where it does not show up under any user's balance. Once the claim terminates, the value is split among the appropriate parties (customer + business or just business if the claim is expired or the customer if the claim is fulfilled). Credit is then applied to the entity's balance where they can withdraw (pull) at their liesure.

### killswitch

contract was made pausable through openzepplin's `lifecycle/Pausable.sol` contract. i purposefully did not want to add this to the UI to make it difficult to trigger from the front end, if only marginally.

### reputation

keep all companies and all customers in the same place (same contract) to help them establish reputation

### notes

some byte arrays should certainly be added to some key points so that companies and customers can create their own papertrail off chain / with extra data. At places like the terminateClaim method as well as the redeem / deredeem methods.


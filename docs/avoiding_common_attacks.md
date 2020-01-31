# Common Attacks

### reentrancy

there is one point where eth is transferred out of the contract, in the releaseTo method. here i have a reentrancy guard to proctect from reentrancy attacks. by doing my transfer (and logs) last, after my state change and using the reentrancy modifier, which uses a counter in the background, it is possible to defend against this attack quite easily. reentrancy was also used because of `.sendValue()` method being used to transfer funds, which is defined in openzepplin's `utils/Addresses.sol` file

### overflow / overflow

by using safemath library from openzepplin, i was able to completely guard against overflow and underflow since a check is made at every method that uses `.add()`, `.sub()`, `.mul()`, and `.div()`

### transaction ordering / timestamp dependence

while the contract does use timestamps internally, it does have any transactions that would not ultimately be detrimental to the person calling them if they were called out of order. For instance, if a customer redeemed a claim, then as they were waiting for the business to fulfill the claim, de-redeemed the claim, then they would be out the fees that cost them to run the transaction and they would still be bleeding time from the refund decay.

### loop avoidance

i removed all loops and opted for an erc721 token tracking system in the stead of arrays.

### Denial of Service with Failed Call

for this attack I have tried to make every action reversable by one of the two entites interacting. it is not always possible, but generally it is well covered throughout the contract.

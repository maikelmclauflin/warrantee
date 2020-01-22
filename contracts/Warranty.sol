pragma solidity >=0.4.21 <0.7.0;

import "./Dependencies.sol";

contract Warranty is Dependencies {
  mapping(uint256 => address) public _pendingTransfer;
  mapping(address => uint256) public _balances;

  string public symbol;
  string public name;
  uint256 public decimals;

  Claim[] public _claims;
  struct Claim {
    address warrantor;
    uint256 value;
    uint256 valuation;
    uint256 expiresAfter;
    uint256 activatedAt;
    uint256 delayTime;
    bool redeemed;
    bool fulfilled;
    bool terminated;
  }

  event BalanceUpdated(address indexed addr, uint256 amount, uint256 balance, bool negative);
  event Withdrawn(address indexed addr, address indexed target, uint256 amount, uint256 balance);
  event Redeemed(address indexed warrantor, address indexed warrantee, uint256 indexed tokenId);
  event Fulfilled(address indexed warrantor, address indexed warrantee, uint256 indexed tokenId, bool redeemed);
  event Terminated(uint256 indexed tokenId);
  event Guaranteed(address indexed warrantor, uint256 indexed tokenId);
  event ClaimBalanceUpdated(uint256 indexed tokenId, uint256 value);

  modifier warranteeOrWarrantorOnly(uint256 tokenId) {
    require((
      isWarrantee(msg.sender, tokenId) ||
      isWarrantor(msg.sender, tokenId)
    ), "sender must either be the token owner (warrantee) or the warrantor");
    _;
  }
  modifier warranteeOnly(uint256 tokenId) {
    require(msg.sender == this.ownerOf(tokenId), "sender must be the owner of the token");
    _;
  }
  modifier warrantorOnly(uint256 tokenId) {
    require(isWarrantor(msg.sender, tokenId), "sender must be the warrantor of the token");
    _;
  }
  modifier notRedeemedOnly(uint256 tokenId) {
    require(!_claims[tokenId].redeemed, "only non redeemed claims can use this method");
    _;
  }
  modifier notTerminatedOnly(uint256 tokenId) {
    require(!_claims[tokenId].terminated, "only non terminated claims can use this method");
    _;
  }
  modifier greaterThanOrEqual(uint256 a, uint256 b) {
    require(a >= b, "a must be greater than or equal to b");
    _;
  }
  modifier checkWarranteeOf(address warrantee, uint256 tokenId) {
    if (warrantee != address(0)) { // any owner is honored
      require(isWarrantee(warrantee, tokenId), "must be working with the correct warrantee");
    }
    _;
  }
  function isWarrantee(address addr, uint256 tokenId) public view returns(bool) {
    return addr == this.ownerOf(tokenId);
  }
  function isWarrantor(address addr, uint256 tokenId) public view returns(bool) {
    return addr == _claims[tokenId].warrantor;
  }
  function timestamp() public view returns(uint256) {
    return block.timestamp;
  }
  // check the balances assigned to each account
  function balance(address account) public view returns(uint256) {
    return _balances[account];
  }
  // extend the timeline until the claim expires
  function extendClaimExpiration(uint256 tokenId, uint256 expiryTime, uint256 delayTime)
    public
    whenNotPaused
    warrantorOnly(tokenId)
    notTerminatedOnly(tokenId)
    notRedeemedOnly(tokenId)
  {
    _claims[tokenId].expiresAfter = _claims[tokenId].expiresAfter.add(expiryTime);
    _claims[tokenId].delayTime = _claims[tokenId].delayTime.add(delayTime);
  }
  // overwrites PullPayment method to only allow owner to assign value to be pulled
  // implicit payable just eats eth
  function updateBalance(address payee, uint256 amount, bool negative) internal {
    if (amount == 0) return;
    if (negative) {
      _balances[payee] = _balances[payee].sub(amount);
    } else {
      _balances[payee] = _balances[payee].add(amount);
    }
    emit BalanceUpdated(payee, amount, _balances[payee], negative);
  }
  function credit(address payee, uint256 amount) internal {
    updateBalance(payee, amount, false);
  }
  function debit(address payer, uint256 amount) internal {
    updateBalance(payer, amount, true);
  }
  // the publicly available version of credit
  function deposit(address payee) public payable whenNotPaused {
    credit(payee, msg.value);
  }
  // the warrantor can fulfill the claim for the amount agreed upon when the claim was first created.
  function fulfillClaim(address warrantee, uint256 tokenId)
    public
    payable
    whenNotPaused
    warrantorOnly(tokenId)
    checkWarranteeOf(warrantee, tokenId)
    notTerminatedOnly(tokenId)
  {
    Claim storage claim = _claims[tokenId];
    // if the warrantor sends more than enough or has enough in their balance
    uint256 bal = balance(msg.sender);
    debit(msg.sender, bal); // guarantor temporarily has zero balance
    uint256 value = claim.value.add(msg.value).add(bal);
    require(value >= claim.valuation, "claim can only be fullfilled for the original agreed upon valuation");
    credit(msg.sender, value.sub(claim.valuation));
    credit(this.ownerOf(tokenId), claim.valuation);
    updateClaimValue(tokenId, 0); // remove funds locked in claim
    claim.fulfilled = true;
    emit Fulfilled(msg.sender, warrantee, tokenId, claim.redeemed);
    _terminateClaim(tokenId);
  }
  function _terminateClaim(uint256 tokenId) internal {
    Claim storage claim = _claims[tokenId];
    if (!claim.fulfilled) {
      // should only have value assigned, to be divii'd up if claim has not been fulfilled
      uint256 value = claim.value;
      uint256 elapsed = claim.expiresAfter.sub(timeToClaimExpire(tokenId));
      uint256 leftover = value.mul(claim.expiresAfter).sub(value.mul(elapsed)).div(claim.expiresAfter);
      credit(this.ownerOf(tokenId), leftover);
      credit(claim.warrantor, value.sub(leftover));
    }
    claim.terminated = true;
    emit Terminated(tokenId);
  }
  // goodBookkeeping is a public function to assist good samaritans to help businesses keep their books clean
  function goodBookkeeping(uint256 tokenId)
    public
    whenNotPaused
    notTerminatedOnly(tokenId)
  {
    require(timestamp() > claimExpireTime(tokenId), "good bookkeeping can only be called when claim has expired");
    _terminateClaim(tokenId);
  }
  // terminateClaim ends the claim
  function terminateClaim(uint256 tokenId)
    public
    whenNotPaused
    warranteeOrWarrantorOnly(tokenId)
    notTerminatedOnly(tokenId)
  {
    _terminateClaim(tokenId);
  }
  function releaseTo(address payable _target, uint256 amount)
    public
    nonReentrant
    whenNotPaused
    greaterThanOrEqual(_balances[msg.sender], amount)
  {
    address payable sender = msg.sender;
    address payable target = _target;
    if (address(0) == target) {
      target = sender;
    }
    debit(sender, amount);
    target.sendValue(amount);
    emit Withdrawn(sender, target, amount, _balances[sender]);
  }
  function createAndGuaranteeClaim(address payable warrantee, uint256 valuation, uint256 expiresAfter)
    public
    payable
    whenNotPaused
    returns(uint256)
  {
    uint256 tokenId = createClaim(warrantee, valuation, expiresAfter);
    guaranteeClaim(tokenId);
    return tokenId;
  }
  function claimExpireTime(uint256 tokenId)
    public
    view
    whenNotPaused
    returns(uint256)
  {
    return _claims[tokenId].activatedAt.add(_claims[tokenId].delayTime).add(_claims[tokenId].expiresAfter);
  }
  function timeToClaimExpire(uint256 tokenId)
    public
    view
    whenNotPaused
    returns(uint256)
  {
    uint256 expireTime = claimExpireTime(tokenId);
    uint256 tsmp = timestamp();
    if (expireTime <= tsmp) {
      return 0;
    }
    return expireTime.sub(tsmp);
  }
  // guarantee a claim by assigning value to it
  function guaranteeClaim(uint256 tokenId)
    public
    payable
    whenNotPaused
    notRedeemedOnly(tokenId)
    notTerminatedOnly(tokenId)
  {
    Claim storage claim = _claims[tokenId];
    if (claim.warrantor != msg.sender) {
      // if selling to self, do not require value to be sent as well
      if (claim.value != 0) {
        // transfer to previous warrantor
        require(_pendingTransfer[tokenId] != address(0), "claim must be pending transfer");
        require(claim.warrantor != address(0), "claim must be guaranteed to have value");
        require(msg.value >= claim.value, "claim must preserve currently backed value");
        credit(claim.warrantor, claim.value); // give back the value provided by previous warrantor
        claim.value = 0; // reset value
        _pendingTransfer[tokenId] = address(0);
      }
      claim.warrantor = msg.sender;
      if (claim.activatedAt == 0) {
        claim.activatedAt = timestamp();
      }
      emit Guaranteed(msg.sender, tokenId);
    }
    fundClaim(tokenId); // back claim with new value
  }
  function sellClaim(uint256 tokenId, address buyer)
    public
    whenNotPaused
    warrantorOnly(tokenId)
  {
    require(_pendingTransfer[tokenId] == address(0), "only claims that are not being sold can be put up for sale");
    /* sender is warrantor */
    require(buyer != msg.sender, "cannot sell to warrantor");
    _pendingTransfer[tokenId] = buyer;
  }
  // anybody can add to a claim's value. value will only be accessable to the owner
  function fundClaim(uint256 tokenId)
    public
    payable
    whenNotPaused
  {
    creditClaim(tokenId, msg.value);
  }
  function creditClaim(uint256 tokenId, uint256 value) internal {
    if (value != 0) {
      updateClaimValue(tokenId, _claims[tokenId].value.add(value));
    }
  }
  function updateClaimValue(uint256 tokenId, uint256 value) internal {
    _claims[tokenId].value = value;
    emit ClaimBalanceUpdated(tokenId, value);
  }
  // for false redemptions. allows warrantor to reset time if guarantee's submission did not meet agreement
  function deredeemClaim(uint256 tokenId, uint256 expiryTime, uint256 delayTime)
    public
    whenNotPaused
    warrantorOnly(tokenId)
  {
    require(_claims[tokenId].redeemed, "only a redeemed claim can be reset");
    _claims[tokenId].redeemed = false;
    extendClaimExpiration(tokenId, expiryTime, delayTime);
  }
  // guarantee can redeem their claim
  // no need to set a timestamp because they will get all of their funds back if claim is accepted
  function redeemClaim(uint256 tokenId)
    public
    whenNotPaused
    warranteeOnly(tokenId)
    notTerminatedOnly(tokenId)
  {
    Claim storage claim = _claims[tokenId];
    require(!claim.redeemed, "claim cannot be redeemed");
    claim.redeemed = true;
    emit Redeemed(claim.warrantor, this.ownerOf(tokenId), tokenId);
  }
  function createClaim(address payable warrantee, uint256 valuation, uint256 expiresAfter)
    public
    whenNotPaused
    returns(uint256)
  {
    uint256 tokenId = _claims.length;
    require(safeMint(warrantee, tokenId), "should be able to mint the token");
    _claims.push(Claim({
      valuation: valuation,
      // set when the claim is guaranteed
      value: 0,
      warrantor: address(0),
      activatedAt: 0,
      delayTime: 0,
      // only need approximations
      expiresAfter: expiresAfter,
      redeemed: false,
      fulfilled: false,
      terminated: false
    }));
    return tokenId;
  }

  function () external payable {
    deposit(msg.sender);
  }
}

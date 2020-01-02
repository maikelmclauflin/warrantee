pragma solidity >=0.4.21 <0.7.0;
// pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Mintable.sol";

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Warrantee is ERC721Burnable, ERC721Mintable, Ownable, ReentrancyGuard {
  using SafeMath for uint256;
  using Math for uint256;
  using Address for address payable;

  mapping(address => uint256) private _holdings;
  string public _sku;
  uint256 public _lockedBalance;
  Warranty[] public _warranties;
  string public symbol;
  string public name;
  uint256 public decimals;
  struct Warranty {
    uint256 value;
    uint256 valuation;
    uint256 expiresAfter;
    uint256 createdAt;
    bool claimed;
    bool terminated;
  }

  event Deposited(address indexed payee, uint256 amount);
  event Withdrawn(address indexed warrantee, address indexed target, uint256 amount, uint256 balance);
  event Terminated(uint256 indexed tokenId, uint256 value, uint256 leftover, bool claimed);

  constructor() public {
    symbol = "WRNTE";
    name = "Warrantee";
    decimals = 0;
  }
  modifier warranteeOrOwnerOnly(uint256 id) {
    if (msg.sender == this.ownerOf(id)) {
      _;
    } else if (msg.sender == this.owner()) {
      _;
    } else {
      require(false, "sender must either be the owner of the token or the owner of the contract");
    }
  }
  modifier warranteeOnly(uint256 id) {
    require(msg.sender == this.ownerOf(id), "sender must be the owner of the token");
    _;
  }
  modifier greaterThanOrEqual(uint256 a, uint256 b) {
    require(a >= b, "a must be greater than or equal to b");
    _;
  }
  function timestamp() public view returns(uint256) {
    return block.timestamp;
  }
  function balance(address account) public view returns(uint256) {
    return _holdings[account];
  }
  // overwrites PullPayment method to only allow owner to assign value to be pulled
  function deposit(address payee, uint256 amount) internal {
    if (amount == 0) {
      return;
    }
    _holdings[payee] = _holdings[payee].add(amount);
    emit Deposited(payee, amount);
  }
  function terminateAgreement(uint256 id) public warranteeOrOwnerOnly(id) {
    Warranty storage warranty = _warranties[id];
    uint256 time = timestamp();
    uint256 value = warranty.value;
    uint256 elapsed = time.sub(time.min(warranty.createdAt));
    uint256 leftover = value.mul(warranty.expiresAfter).sub(value.mul(elapsed)).div(warranty.expiresAfter);
    deposit(this.ownerOf(id), leftover);
    deposit(this.owner(), value.sub(leftover));
    warranty.terminated = true;
    emit Terminated(id, value, leftover, warranty.claimed);
  }
  function release(address payable _target, uint256 amount)
    public
    nonReentrant
    greaterThanOrEqual(_holdings[msg.sender], amount)
  {
    address payable sender = msg.sender;
    address payable target = _target;
    if (address(0) == target) {
      target = sender;
    }
    uint256 total = _holdings[sender].sub(amount);
    _holdings[sender] = total;
    target.sendValue(amount);
    emit Withdrawn(sender, target, amount, _holdings[sender]);
  }
  function claim(uint256 id)
    public
    warranteeOnly(id)
  {
    Warranty storage warranty = _warranties[id];
    require(!warranty.claimed, "warranty cannot be claimed");
    warranty.claimed = true;
    terminateAgreement(id);
  }
  function create(address payable owner, uint256 valuation, uint256 expiresAfter)
    public
    payable
    onlyOwner
  {
    uint256 value = msg.value;
    _lockedBalance = _lockedBalance.add(value);
    require(super.safeMint(owner, _warranties.length), "should be able to mint the token");
    _warranties.push(Warranty({
      value: value,
      valuation: valuation,
      // only need approximations
      createdAt: timestamp(),
      expiresAfter: expiresAfter,
      claimed: false,
      terminated: false
    }));
  }
  function valuation (bool includeExpired) public view returns (uint256) {
    uint minTimestamp = timestamp();
    if (includeExpired) {
      minTimestamp = 0;
    }
    Warranty[] memory warranties = _warranties;
    uint256 length = warranties.length;
    uint256 _valuation = 0;
    for (uint256 i = 0; i < length; i += 1) {
      Warranty memory warranty = warranties[i];
      if (!warranty.claimed && (minTimestamp <= (warranty.createdAt + warranty.expiresAfter))) {
        _valuation = _valuation.add(warranty.valuation);
      }
    }
    return _valuation;
  }
  // function () external payable {
  //   require(false, "unable to call default function");
  // }
}

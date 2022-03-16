// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev This abstract contract allows children to implement a blacklist
 * mechanism that can be used to prevent bad actors from transferring funds.
 */
abstract contract Blacklistable is Ownable {
  mapping(address => bool) internal blacklisted;

  event Blacklisted(address indexed _account);
  event UnBlacklisted(address indexed _account);

  modifier onlyBlacklisted(address _account) {
    require(blacklisted[_account], "Blacklistable: address is NOT blacklisted");
    _;
  }

  modifier notBlacklisted(address _account) {
    require(!blacklisted[_account], "Blacklistable: address is blacklisted");
    _;
  }

  function isBlacklisted(address _account) external view returns (bool) {
    return blacklisted[_account];
  }

  function blacklist(address _account) external onlyOwner {
    blacklisted[_account] = true;
    emit Blacklisted(_account);
  }

  function unblacklist(address _account) external onlyOwner {
    blacklisted[_account] = false;
    emit UnBlacklisted(_account);
  }
}

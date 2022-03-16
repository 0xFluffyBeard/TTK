// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Blacklistable.sol";

/**
 *
 * Custom ERC20
 *
 * [X] 1) Ownership using an Ownable. I am the owner of the contract and any important method should have an onlyOwner modifier (you choose what's important)
 * [X] 2) minting 10,000,000 tokens
 * [X] 3) Calling it TESTTOK, $TTK
 * [X] 4) having a blacklist, and a way to blacklist/unblacklist addressess
 * [X] 5) Burning tokens
 * [ ] 6) Tax. If a person is buying, tax them 10%. If they are selling, tax them 20%.
 * [ ] 7) Tests
 *
 */
contract Token is ERC20, ERC20Burnable, Pausable, Ownable, Blacklistable {
    constructor() ERC20("TESTTOK", "TTK") {
        _mint(msg.sender, 10000000 * 10 ** decimals());
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused or called by the owner.
     */
    modifier whenNotPausedOrOwner() {
        require(!paused() || owner() == _msgSender(), "Pausable: paused");
        _;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPausedOrOwner
        notBlacklisted(from)
        notBlacklisted(to)
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * Allows the owner to burn all funds of a blacklisted account without an allowance
     */
    function burnBlacklistedFunds(address _account) external onlyOwner onlyBlacklisted(_account) {
        uint256 balance = balanceOf(_account);
        _burn(_account, balance);
    }
}

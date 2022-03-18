// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Taxable is ERC20, Ownable {
  uint256 public buyTax;
  uint256 public sellTax;
  uint256 public transferTax;

  mapping (address => bool) private taxedLpPairs;
  mapping (address => bool) private exemptFromTaxes;

  address private taxWallet;

  event TaxedLpPairAdded(address indexed _address);
  event TaxedLpPairRemoved(address indexed _address);
  event ExcemptFromTaxesAdded(address indexed _account);
  event ExcemptFromTaxesRemoved(address indexed _account);

  constructor(uint256 _buyTax, uint256 _sellTax, uint256 _transferTax, address _taxWallet) {
    buyTax = _buyTax;
    sellTax = _sellTax;
    transferTax = _transferTax;
    taxWallet = _taxWallet;

    exemptFromTaxes[owner()] = true;
  }

  function isTaxedLpPair(address _address) external view returns (bool) {
    return taxedLpPairs[_address];
  }

  function addTaxedLpPair(address _address) external onlyOwner {
    taxedLpPairs[_address] = true;
    emit TaxedLpPairAdded(_address);
  }

  function removeTaxedLpPair(address _address) external onlyOwner {
    taxedLpPairs[_address] = false;
    emit TaxedLpPairRemoved(_address);
  }

  function isExcemptFromTaxes(address _account) external view returns (bool) {
    return exemptFromTaxes[_account];
  }

  function addExcemptFromTaxes(address _account) external onlyOwner {
    exemptFromTaxes[_account] = true;
    emit ExcemptFromTaxesAdded(_account);
  }

  function removeExcemptFromTaxes(address _account) external onlyOwner {
    exemptFromTaxes[_account] = false;
    emit ExcemptFromTaxesRemoved(_account);
  }

  function setTaxes(uint256 _buyTax, uint256 _sellTax, uint256 _transferTax) external onlyOwner {
    buyTax = _buyTax;
    sellTax = _sellTax;
    transferTax = _transferTax;
  }

  function setTaxWallet(address _taxWallet) external onlyOwner {
    taxWallet = _taxWallet;
  }

  /**
   * @dev initiates a transfer of the tax amount to the taxWallet, if needed.
   */
  function _payTax(address from, address to, uint256 amount) internal returns (uint256) {
    if (exemptFromTaxes[from] || exemptFromTaxes[to] || to == taxWallet) {
      return amount;
    }

    uint256 _tax = _calculateTax(from, to);

    if (_tax == 0) {
      return amount;
    }

    uint256 _taxAmount = amount / 100 * _tax;

    /**
     * I don't realy like to do it this way, but that's a limitation of the OZ ERC20 contract (_balances is ).
     * What I don't like: _transfer() will trigger the full cycle with _beforeTokenTransfer().
     * And it will reenter this same function.
     * Even if it will exit in the first "if", that's still useless waste of GAS.
     * I would try to optimize that in production.
     */
    _transfer(from, taxWallet, _taxAmount);

    return amount - _taxAmount;
  }

  /**
   * @dev Calculates which tax needs to be paid
   */
  function _calculateTax(address from, address to) internal view returns (uint256) {
    if (taxedLpPairs[from]) {
      return buyTax;
    }

    if (taxedLpPairs[to]) {
      return sellTax;
    }

    return transferTax;
  }
}

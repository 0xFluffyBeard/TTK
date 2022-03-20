const { expectRevert } = require('@openzeppelin/test-helpers')
const { describe } = require('yargs')

const Token = artifacts.require("Token")

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Token", (accounts) => {

  let instance
  let creator = accounts[0]
  let account1 = accounts[1]
  let account2 = accounts[2]
  let account3 = accounts[3]


  beforeEach(async () => {
    instance =  await Token.deployed()
  })

  describe('Creation', () => {
    it('Should have name and symbol', async () => {
      assert.lengthOf(await instance.name(), 7, "the name to have a length of 7")
      assert.lengthOf(await instance.symbol(), 3, "the symbol to have a length of 3")
    })

    it('Should mint initial supply to creator', async () => {
      let initialSupply = await instance._initialSupply()
      let totalSupply = await instance.totalSupply()
      let ownerBalance = await instance.balanceOf(creator)
  
      assert.isTrue(initialSupply > 0, 'initialSupply to be > 0')
      assert.equal(
        totalSupply.toString(),
        initialSupply.toString(),
        "totalSupply to be same as initialSupply"
      )
      assert.equal(
        ownerBalance.toString(),
        initialSupply.toString(),
        "ownerBalance to be same as initialSupply"
      )
    })

    it('Should be owned by the creator', async () => {
      assert.equal(await instance.owner(), creator, "the creator to be the owner")
    })
  })

  describe('Minting', () => {
    it('Should increase balance and totalSupply', async () => {
      let totalSupplyBeforeMint = await instance.totalSupply()
      let balanceBeforeMint = await instance.balanceOf(account1)
      let amount = web3.utils.toBN(web3.utils.toWei('1000', 'ether'))
  
      await instance.mint(account1, amount)
  
      let totalSupplyAfterMint = await instance.totalSupply()
      let balanceAfterMint = await instance.balanceOf(account1)
  
      assert.equal(
        totalSupplyAfterMint.toString(),
        totalSupplyBeforeMint.add(amount).toString(),
        'totalSupply to be increased by amount'
      )
      assert.equal(
        balanceAfterMint.toString(),
        balanceBeforeMint.add(amount).toString(),
        'balance to be increased by amount'
      )
    })

    it('Can be minted only by the owner', async () => {
      let totalSupplyBeforeMint = await instance.totalSupply()
      let balanceBeforeMint = await instance.balanceOf(account1)
      let amount = web3.utils.toBN(web3.utils.toWei('1000', 'ether'))
  
      await expectRevert(
        instance.mint(account2, amount, {from: account2}),
        'Ownable: caller is not the owner'
      )
  
      let totalSupplyAfterMint = await instance.totalSupply()
      let balanceAfterMint = await instance.balanceOf(account1)

      assert.equal(
        totalSupplyAfterMint.toString(),
        totalSupplyBeforeMint.toString(),
        "totalSupply to be unchanged"
      )
      assert.equal(
        balanceAfterMint.toString(),
        balanceBeforeMint.toString(),
        "balance to be unchanged"
      )
    })
  })

  describe('Transfer', () => {
    it('Should decrease balance of the sender and increase balance of the recipient', async () => {
      let totalSupplyBefore = await instance.totalSupply()
      let ownerBalanceBefore = await instance.balanceOf(creator)
      let account1BalanceBefore = await instance.balanceOf(account1)
      let amount = web3.utils.toBN(web3.utils.toWei('1000', 'ether'))

      await instance.transfer(account1, amount);

      let ownerBalanceAfter = await instance.balanceOf(creator)
      let account1BalanceAfter = await instance.balanceOf(account1)
      let totalSupplyAfter = await instance.totalSupply()

      assert.equal(
        ownerBalanceAfter.toString(),
        ownerBalanceBefore.sub(amount).toString(),
        "sender's balance to decrease"
      )
      assert.equal(
        account1BalanceAfter.toString(),
        account1BalanceBefore.add(amount).toString(),
        "receiver's balance to increase"
      )
      assert.equal(
        totalSupplyAfter.toString(),
        totalSupplyBefore.toString(),
        "totalSupply to stay the same"
      )
    })

    it('Should not allow to transfer when paused', async () => {
      let ownerBalanceBefore = await instance.balanceOf(creator)
      let account1BalanceBefore = await instance.balanceOf(account1)
      let amount = web3.utils.toBN(web3.utils.toWei('1000', 'ether'))

      await instance.pause();

      await expectRevert(
        instance.transfer(account3, amount, {from: account2}),
        'Pausable: paused'
      )

      await instance.unpause();
    })

    it('Should allow the owner to transfer when paused', async () => {
      let amount = web3.utils.toBN(web3.utils.toWei('1000', 'ether'))

      await instance.pause();

      await instance.transfer(account2, amount);

      await instance.unpause();

      let ownerBalanceAfter = await instance.balanceOf(creator)
      let account1BalanceAfter = await instance.balanceOf(account1)

      assert.equal(
        ownerBalanceAfter.toString(),
        ownerBalanceBefore.sub(amount).toString(),
        "sender's balance to decrease"
      )
      assert.equal(
        account1BalanceAfter.toString(),
        account1BalanceBefore.add(amount).toString(),
        "receiver's balance to increase"
      )
    })

    it('Should not allow to transfer if blacklisted', async () => {
      let amount = web3.utils.toBN(web3.utils.toWei('1000', 'ether'))

      await instance.blacklist(account2);

      await expectRevert(
        instance.transfer(account3, amount, {from: account2}),
        'Blacklistable: address is blacklisted'
      )

      await instance.unblacklist(account2);
    })

    describe('Taxable', async () => {
      let buyTax = 5;
      let sellTax = 10;
      let transferTax = 15;

      before(async () => {
        await instance.setTaxes(5, 10, 15);
      })

      it('Should pay tax when buy', async () => {
        let amount = web3.utils.toBN(web3.utils.toWei('1000', 'ether'))
        let tax = amount.div(100).mul(buyTax)


      })
    })
  })

  describe('Pause', () => {
    /**
     * TODO:
     * 1) Should allow the owner to pause
     * 2) Should not allow non owner to pause
     * 3) Should allow the owner to unpause
     * 4) Should not allow non owner to unpause
     */
  })

  describe('Blacklist', () => {
    /**
     * TODO:
     * 1) Should allow the owner to blacklist accounts
     * 2) Should not allow non owner to blacklist accounts
     * 3) Should allow the owner to unblacklist accounts
     * 4) Should not allow non owner to unblacklist accounts
     */
  })
})

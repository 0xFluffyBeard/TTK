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
    /**
     * TODO: Test basic transfer
     * 1) Should decrease balance of the sender and increase balance of the recipient
     * 2) Should not change total supply
     * 3) Should not allow to transfer when paused
     * 4) Should allow the owner to transfer when paused
     * 5) Should not allow to transfer if blacklisted
     * 
     */
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

const Token = artifacts.require("Token");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Token", (accounts) => {

  let instance
  let creator = accounts[0]
  let account1 = accounts[1]


  beforeEach(async () => {
    instance =  await Token.deployed()
  });

  describe('Creation', () => {
    it('Should have name and symbol', async () => {
      assert.lengthOf(await instance.name(), 7, "the name to have a length of 7");
      assert.lengthOf(await instance.symbol(), 3, "the symbol to have a length of 3");
    })

    it('Should mint initial supply to creator', async () => {
      let initialSupply = await instance._initialSupply()
      let totalSupply = await instance.totalSupply()
      let ownerBalance = await instance.balanceOf(creator)
  
      assert.isTrue(initialSupply > 0, 'initialSupply to be > 0')
      assert.equal(totalSupply.toString(), initialSupply.toString(), "totalSupply to be same as initialSupply")
      assert.equal(ownerBalance.toString(), initialSupply.toString(), "ownerBalance to be same as initialSupply")
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
  
      assert.equal(totalSupplyAfterMint.toString(), totalSupplyBeforeMint.add(amount).toString(), 'totalSupply to be increased by amount');
      assert.equal(balanceAfterMint.toString(), balanceBeforeMint.add(amount).toString(), 'balance to be increased by amount');
    })
  })
})

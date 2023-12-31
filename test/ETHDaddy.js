const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("ETHDaddy", () => {

  let ethDaddy
  let deployer, owner1

  beforeEach(async()=>{
    [deployer,owner1] = await ethers.getSigners();

    const ETHDaddy = await ethers.getContractFactory('ETHDaddy')
    ethDaddy = await ETHDaddy.deploy('ETH Daddy','ETHD')

    const transaction = await ethDaddy.connect(deployer).list("ronnie.eth",tokens(10))
  })

  describe('Deployment',()=>{
    it('has a name',async ()=>{
      const result = await ethDaddy.name()
      expect(result).to.equal('ETH Daddy')
    })
  
    it('has a symbol',async ()=>{
      const result = await ethDaddy.symbol();
      expect(result).to.equal('ETHD')
    })

    it('Sets owner',async ()=>{
      const result = await ethDaddy.owner();
      expect(result).to.equal(deployer.address)
    })
  })

  describe('Domian', ()=>{
    it("Returns domain attriburtes", async ()=>{
      let domain = await ethDaddy.getDomain(1);
      expect(domain.name).to.equal("ronnie.eth") 
      expect(domain.cost).to.equal(tokens(10))
      expect(domain.isOwned).to.equal(false)  
    })

    it('Returns maxSupply',async ()=>{
      const result = await ethDaddy.maxSupply();
      expect(result).to.equal(1)
    })

    it('Returns totalSupply',async ()=>{
      const result = await ethDaddy.totalSupply();
      expect(result).to.equal(0)
    })
  })

  describe('Minting',()=>{
    const ID = 1;
    const AMOUNT = ethers.utils.parseUnits('10','ether');

    beforeEach(async()=>{
      const transaction = await ethDaddy.connect(owner1).mint(ID, {value: AMOUNT})
      await transaction.wait()
    })


    it('Updates the owner', async ()=>{
      const owner = await ethDaddy.ownerOf(ID)
      expect(owner).to.equal(owner1.address)
    })

    it('Update the domain status',async ()=>{
      const domain = await ethDaddy.getDomain(ID)
      expect(domain.isOwned).to.equal(true)
    })

    it('Updates the contract balance', async ()=>{
      const result = await ethDaddy.getBalance()
      expect(result).to.equal(AMOUNT)
    })
  })

  describe('Withdrawing',()=>{
    const ID = 1;
    const AMOUNT = ethers.utils.parseUnits('10','ether');
    let balanceBefore

    beforeEach(async()=>{
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await ethDaddy.connect(owner1).mint(ID, {value: AMOUNT})
      await transaction.wait()

      transaction = await ethDaddy.connect(deployer).withdraw();
      await transaction.wait()
    })


    it('Updates the owner balance', async ()=>{
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async ()=>{
      const result = await ethDaddy.getBalance()
      expect(result).to.equal(0)
    })
  })

})




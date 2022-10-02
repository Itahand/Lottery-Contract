const { expect } = require('chai');
const { ethers } = require('hardhat');
const { beforeEach } = require('mocha');

const provider = new ethers.providers.JsonRpcProvider();
const tokens = (n) => {
  // Helper function for decimals.
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const decimals = (n) => {
  // Turn bigNumbers into readable numbers.
  return n / 1000000000000000000
}

describe('Lottery', () => {
  // Assigning global variables inside the function.
  let lottery, accounts

  beforeEach(async () => {
    // Retreiving the lottery
    const Lottery = await ethers.getContractFactory('Lottery')
    lottery = await Lottery.deploy()
    await lottery.deployed();
    // Assigning addresses to accounts.
    accounts = await ethers.getSigners()
    manager = accounts[0]
    player1 = accounts[1]
    player2 = accounts[2]
  })

  describe('Deployment', () => {

    it('has correct manager', async () => {
      expect(await lottery.manager()).to.equal(manager.address)
    })

     it('Players array starts empty', async () => {
      let players = await lottery.allPlayers()
      expect(players.length).to.equal(0)
    })

  })

  describe('Enter Players', () => {
   // const options = {value: ethers.utils.parseEther("1.0")}

   beforeEach(async () => {
     const options = {value: ethers.utils.parseEther("1.0")}
     let transaction = await lottery.connect(player1).enter(options)
     transaction = await lottery.connect(player2).enter(options)

     await transaction.wait()
   })


    it('Adds players correctly', async () => {
      let players = await lottery.allPlayers()
      expect(players.length).to.equal(2)
    })

    it('It keeps track of balance', async() => {
      expect(decimals(await ethers.provider.getBalance(lottery.address))).to.equal(2)
    })
  })

  describe('Pick winner', () => {

    beforeEach(async () => {
      const options = {value: ethers.utils.parseEther("1.0")}
      console.log('Before playing', decimals(await ethers.provider.getBalance(player1.address)), decimals(await ethers.provider.getBalance(player2.address)))
      await lottery.connect(player1).enter(options)
      await lottery.connect(player2).enter(options)
      console.log('After playing', decimals(await ethers.provider.getBalance(player1.address)), decimals(await ethers.provider.getBalance(player2.address)))
      await lottery.connect(manager).pickWinner()
      console.log('After Picking Winner', decimals(await ethers.provider.getBalance(player1.address)), decimals(await ethers.provider.getBalance(player2.address)))

    })

/*     it('Only owner can access it', async() => {

********** THIS WORKS BUT CAN'T FIGURE OUT THE RIGHT WAY TO ASSERT IT TO FALSE *********************

      expect(await lottery.connect(player2).pickWinner()).to.not.be.rejected
    }) */

    it('Sends the contracts balance to the winner', async () => {
      expect(decimals(await ethers.provider.getBalance(lottery.address))).to.equal(0)
    })
    it('Clears all players from the contract', async () => {
      let players = await lottery.allPlayers()
      expect(players.length).to.equal(0)
    })
  })
})
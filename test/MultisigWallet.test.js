const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')

const { assert, expect } = require('chai')
const { ethers } = require('hardhat')

describe('MultiSigWallet', () => {

    async function deployFixture() {
        const [deployer, owner1, owner2, owner3] = await ethers.getSigners()

        const MultisigWallet = await hre.ethers.getContractFactory(
            'MultisigWallet'
        )
        
        const accounts = [owner1.address, owner2.address, owner3.address]

        const multisigWallet = await MultisigWallet.deploy(accounts, 2)
        multisigWallet.deployed()
        return { multisigWallet, owner1, owner2, owner3 }
    }

    describe('deployment', () => {
        it('should deploy the contract and set the owners to the provided owners', async () => {
            const { multisigWallet, owner1, owner2, owner3 } =
            await loadFixture(deployFixture)
            const owners = await multisigWallet.getOwners()
            expect(owners[0]).to.equal(owner1.address)
            expect(owners[1]).to.equal(owner2.address)
            expect(owners[2]).to.equal(owner3.address)
        })
        it("should set the value of quorum required properly", async () => {
            const {multisigWallet} = await loadFixture(deployFixture)
            const quorumRequired = await multisigWallet.quorumRequired()
            expect(quorumRequired).to.equal(2)
        })
    })

    describe('creation of withdraw transaction', () => {
        it("should create the withdraw transaction properly", async () => {
            const accounts = await ethers.getSigners()
            const receiver = accounts[4].address;
            const {multisigWallet, owner1} = await loadFixture(deployFixture)
            await multisigWallet.connect(owner1).createWithdrawTx(receiver, ethers.utils.parseEther('0.1'))
            const txCount = await multisigWallet.getWithdrawTxCount();
            const tx = await multisigWallet.getWithdrawTxes()
            
            expect(txCount.toNumber()).to.equal(1);

            // console.log(tx)
            // expect(1).to.equal(1);
        })
    })

    describe('approve withdraw transaction', () => {
        it("owner can approve the withdraw transaction", async () => {
            const accounts = await ethers.getSigners()
            const receiver = accounts[4].address;
            const {multisigWallet, owner1} = await loadFixture(deployFixture)
            await multisigWallet.connect(owner1).createWithdrawTx(receiver, ethers.utils.parseEther('0.1'))
            await multisigWallet.connect(owner1).approveWithdrawTx(0)

            const tx = await multisigWallet.getWithdrawTxes()

            expect(tx[0].approvals.toNumber()).to.equal(1);
        })
        it("should revert if called by someone other than owner", async () => {
            const accounts = await ethers.getSigners()
            const receiver = accounts[4].address;
            const {multisigWallet, owner1} = await loadFixture(deployFixture)
            await multisigWallet.connect(owner1).createWithdrawTx(receiver, ethers.utils.parseEther('0.1'))
            await expect(multisigWallet.approveWithdrawTx(0)).to.be.revertedWith("not an owner!!")
        })
    })

})

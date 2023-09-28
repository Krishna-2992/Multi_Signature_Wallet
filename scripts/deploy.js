const hre = require("hardhat");

async function main() {
  const MultisigWallet = await hre.ethers.getContractFactory("MultisigWallet")

  const accounts = [
    '0x0b9Ba03e0D78A473aac15E2B392E0248077bED70',
    '0x12CEC4Db3C41283139742fffF9866E2E6dF91E53'
  ]

  const multisigWallet = await MultisigWallet.deploy(accounts, 1)
  multisigWallet.deployed()

  console.log('the address of multisig wallet is : ', multisigWallet.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

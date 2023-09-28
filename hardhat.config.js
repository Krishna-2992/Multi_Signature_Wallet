require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */

RPC_URL = process.env.RPC_URL
PRIVATE_KEY = process.env.PRIVATE_KEY

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: RPC_URL, 
      accounts: [PRIVATE_KEY]
    }
  }
};

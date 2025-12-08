/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      mining: {
        auto: false,
        interval: [2000, 6000], 
      }
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        process.env.PK_ONE,
        process.env.PK_TWO,
        process.env.PK_THREE,
      ],
    },
  },
};
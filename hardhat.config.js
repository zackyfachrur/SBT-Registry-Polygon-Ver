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
    // ganache: {
    //   url: "http://192.168.0.5:7545",
    //   accounts: [
    //     process.env.PK_ONE,
    //     process.env.PK_TWO,
    //     process.env.PK_THREE,
    //     process.env.PK_FOUR,
    //   ],
    // },
    amoy: {
      url: process.env.POLYGON_RPC_URL || "",
      chainId: 80002,
      accounts: [
        process.env.POLY_PK_ONE,
        process.env.POLY_PK_TWO,
        process.env.POLY_PK_THREE,
        process.env.POLY_PK_FOUR,
      ],
    }
  },
};
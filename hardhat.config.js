require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

module.exports = {
    solidity: "0.8.20",
    networks: {
        hardhat: {},
        polygon: {
            url: "https://polygon-rpc.com/",
            accounts: [`${process.env.PRIVATE_KEY}`],
            gas: 8500000,
            gasPrice: 25000000000 // 25 Gwei
        }
    }
};
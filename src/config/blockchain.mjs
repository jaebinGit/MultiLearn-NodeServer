import { ethers } from 'ethers';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();


const {
    PRIVATE_KEY,
    CONTRACT_ADDRESS,
    PROVIDER_URL
} = process.env;

// 폴리곤 네트워크 설정
const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
let contract;

async function setupContract() {
    try {
        const jsonText = await fs.readFile('./artifacts/contracts/QuestionNFT.sol/QuestionNFT.json', { encoding: 'utf8' });
        const contractJSON = JSON.parse(jsonText);
        contract = new ethers.Contract(CONTRACT_ADDRESS, contractJSON.abi, wallet);
        console.log('Contract setup successfully.');
    } catch (error) {
        console.error('Failed to load contract JSON:', error);
    }
}

export { provider, wallet, contract, setupContract };
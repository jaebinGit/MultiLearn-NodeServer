import { ethers } from 'ethers';
import esClient from '../config/elasticsearch.mjs';
import { provider } from '../config/blockchain.mjs';
import db from '../config/database.mjs';

export const mintNFT = async (wallet, contract, metadataUri) => {
    const currentGasPrice = await provider.getGasPrice();
    const increasedGasPrice = currentGasPrice.mul(110).div(100);

    let nonce = await provider.getTransactionCount(wallet.address, 'latest');
    const estimatedGas = await contract.estimateGas.mintNFT(wallet.address, metadataUri);

    const tx = {
        nonce,
        gasPrice: increasedGasPrice,
        gasLimit: estimatedGas.add(ethers.BigNumber.from(100000)),
        to: contract.address,
        data: contract.interface.encodeFunctionData('mintNFT', [wallet.address, metadataUri]),
        chainId: 137 // 폴리곤 메인넷 체인 ID
    };

    try {
        const signedTx = await wallet.signTransaction(tx);
        const txResponse = await provider.sendTransaction(signedTx);
        const receipt = await txResponse.wait();

        // 토큰 존재 확인
        const tokenId = parseInt(receipt.logs[0].topics[3]);
        const tokenURI = await contract.tokenURI(tokenId); // 성공적으로 발행되었는지 확인
        return { txResponse, tokenId, tokenURI };
    } catch (error) {
        console.error('Transaction failed with error:', error);
        throw error;
    }
};

export const indexNFTData = async (tokenId, data) => {
    console.log('Attempting to index data:', data);

    try {
        const result = await esClient.index({
            index: 'nfts',
            id: tokenId.toString(),
            body: data
        });
        console.log(`Indexed NFT ${tokenId}:`, result);
    } catch (error) {
        console.error('Failed to index NFT data:', error);
        console.log('Error details:', error.message, error.meta?.body?.error);
    }
};

export const getAnswerIdByQuestionId = (questionId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id FROM answers WHERE question_id = ?';
        db.query(query, [questionId], (error, results) => {
            if (error) {
                return reject(error);
            }
            if (results.length === 0) {
                return resolve(null);
            }
            resolve(results[0].id);
        });
    });
};
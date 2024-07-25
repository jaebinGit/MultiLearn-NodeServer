import { uploadMetadataToIPFS } from '../utils/ipfs.mjs';
import { mintNFT, indexNFTData } from '../services/nftService.mjs';
import { executeTransaction } from '../models/nftModel.mjs';
import { contract, wallet } from '../config/blockchain.mjs';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { OPENSEA_API_KEY, CONTRACT_ADDRESS } = process.env;

export const createNFT = async (req, res) => {
    const { questionContent, answerContent, nationality, grade, imageUrl } = req.body;
    const questionId = parseInt(req.params.questionId);
    const metadata = {
        name: questionContent,
        description: answerContent,
        image: imageUrl,
        attributes: [
            { trait_type: "Nationality", value: nationality },
            { trait_type: "Grade", value: grade.toString() }
        ]
    };

    try {
        const metadataUri = await uploadMetadataToIPFS(metadata);
        const txResponse = await mintNFT(wallet, contract, metadataUri);
        const receipt = await txResponse.wait();
        const tokenId = parseInt(receipt.logs[0].topics[3]);

        await executeTransaction(questionId, tokenId, metadataUri);
        await indexNFTData(tokenId, {
            nationality,
            grade,
            questionContent,
            answerContent,
            image: imageUrl
        });

        res.status(201).json({
            message: "NFT minted and data saved successfully.",
            nft: {
                id: questionId,
                tokenId,
                metadataUrl: metadataUri
            }
        });
    } catch (error) {
        console.error('Error during NFT minting or data saving:', error);
        res.status(500).json({ error: "Error minting NFT or saving data" });
    }
};

export const getNFTDetails = async (req, res) => {
    const tokenId = req.params.tokenId;

    try {
        const tokenURI = await contract.tokenURI(tokenId);
        const metadataUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
        const metadataResponse = await axios.get(metadataUrl);
        const metadata = metadataResponse.data;

        // OpenSea API 호출
        const openseaResponse = await axios.get(`https://api.opensea.io/api/v2/collection/questionnft-4/nfts`, {
            headers: { 'X-API-KEY': OPENSEA_API_KEY },
            params: { asset_contract_address: CONTRACT_ADDRESS, token_ids: tokenId }
        });

        const nftData = openseaResponse.data.nfts.find(nft => nft.identifier === tokenId.toString());
        const imageUrl = nftData ? nftData.display_image_url : metadata.image;

        res.status(200).json({
            nftDetails: {
                tokenId,
                metadataUrl: tokenURI,
                questionContent: metadata.name,
                answerContent: metadata.description,
                nationality: metadata.attributes.find(attr => attr.trait_type === "Nationality")?.value,
                grade: metadata.attributes.find(attr => attr.trait_type === "Grade")?.value,
                imageUrl
            }
        });
    } catch (error) {
        console.error('Error fetching NFT details:', error);
        res.status(500).json({ error: "Error fetching NFT details" });
    }
};

export const listNFTs = async (req, res) => {
    try {
        // OpenSea API에서 NFT 목록 가져오기
        const openseaResponse = await axios.get(`https://api.opensea.io/api/v2/collection/questionnft-4/nfts`, {
            headers: { 'X-API-KEY': OPENSEA_API_KEY }
        });

        const nfts = await Promise.all(openseaResponse.data.nfts.map(async nft => {
            try {
                const tokenId = nft.identifier;
                const tokenURI = await contract.tokenURI(tokenId);
                const metadataUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
                const metadataResponse = await axios.get(metadataUrl);
                const metadata = metadataResponse.data;
                const imageUrl = nft.display_image_url;

                return {
                    tokenId: tokenId,
                    metadataUrl: tokenURI,
                    questionContent: metadata.name,
                    answerContent: metadata.description,
                    nationality: metadata.attributes.find(attr => attr.trait_type === "Nationality")?.value,
                    grade: metadata.attributes.find(attr => attr.trait_type === "Grade")?.value,
                    imageUrl: imageUrl,
                    owner: nft.owner // Assuming owner information is available
                };
            } catch (error) {
                console.error(`Error fetching metadata for token ${nft.identifier}:`, error);
                return null;
            }
        }));

        // 유효한 NFT만 필터링
        const validNfts = nfts.filter(nft => nft !== null);

        res.status(200).json({
            nfts: validNfts
        });
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        res.status(500).json({ error: "Error fetching NFTs" });
    }
};
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { PINATA_API_KEY, PINATA_SECRET_API_KEY } = process.env;

export const uploadMetadataToIPFS = async (metadata) => {
    try {
        const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_API_KEY
            }
        });
        return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw error;
    }
};

import express from 'express';
import { createNFT, getNFTDetails, listNFTs } from '../controllers/nftController.mjs';

const router = express.Router();

router.post('/nfts/:questionId', createNFT);
router.get('/nfts/:tokenId', getNFTDetails);
router.get('/questions/nfts', listNFTs);

export default router;
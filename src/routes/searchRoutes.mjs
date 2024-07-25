import express from 'express';
import { searchNFTs, getPopularNFTs } from '../controllers/searchController.mjs';

const router = express.Router();

router.get('/search', searchNFTs);
router.get('/popular-nfts', getPopularNFTs);

export default router;
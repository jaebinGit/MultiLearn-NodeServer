import express from 'express';
import cors from 'cors';
import { setupContract } from './src/config/blockchain.mjs';
import { setupElasticsearch } from './src/config/elasticsearch.mjs';
import nftRoutes from './src/routes/nftRoutes.mjs';
import searchRoutes from './src/routes/searchRoutes.mjs';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api', nftRoutes);
app.use('/api', searchRoutes);

async function initializeServer() {
    await setupContract();
    await setupElasticsearch();

    const PORT = 3000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

initializeServer().catch(console.error);
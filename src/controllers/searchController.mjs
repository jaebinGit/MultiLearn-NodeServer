import esClient from '../config/elasticsearch.mjs';
import { performSearch, fetchPopularNFTs } from '../services/searchService.mjs';

export const searchNFTs = async (req, res) => {
    const { query, nationality, grade } = req.query;
    let searchQuery = {
        bool: {
            must: [],
            filter: []
        }
    };

    if (query) {
        searchQuery.bool.must.push({
            multi_match: {
                query,
                fields: ['questionContent', 'answerContent'],
                type: "best_fields"
            }
        });

        await esClient.index({
            index: 'search_keywords',
            body: {
                keyword: query,
                timestamp: new Date()
            }
        });
    }

    if (nationality) {
        searchQuery.bool.filter.push({ term: { nationality } });
    }

    if (grade) {
        searchQuery.bool.filter.push({ term: { grade } });
    }

    try {
        const results = await performSearch('nfts', searchQuery);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error searching NFTs:', error);
        res.status(500).json({ error: "Error searching NFTs" });
    }
};

export const getPopularNFTs = async (req, res) => {
    try {
        const popularNFTs = await fetchPopularNFTs();
        res.status(200).json(popularNFTs);
    } catch (error) {
        console.error('Error fetching popular NFTs:', error);
        res.status(500).json({ error: "Error fetching popular NFTs" });
    }
};
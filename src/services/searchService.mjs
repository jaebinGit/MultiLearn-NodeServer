import esClient from '../config/elasticsearch.mjs';

// 검색 쿼리 실행
export const performSearch = async (index, query) => {
    try {
        const { body } = await esClient.search({
            index,
            body: {
                query
            }
        });
        return body.hits.hits.map(hit => hit._source);
    } catch (error) {
        console.error('Error performing search:', error);
        throw error;
    }
};

export const fetchPopularNFTs = async () => {
    try {
        const { body: keywordBody } = await esClient.search({
            index: 'search_keywords',
            size: 0,
            body: {
                aggs: {
                    top_keywords: {
                        terms: {
                            field: 'keyword',
                            size: 3
                        }
                    }
                }
            }
        });

        const topKeywords = keywordBody.aggregations.top_keywords.buckets.map(bucket => bucket.key);

        const nftPromises = topKeywords.map(async (keyword) => {
            const { body: nftBody } = await esClient.search({
                index: 'nfts',
                size: 1,
                body: {
                    query: {
                        match: {
                            search_keywords: keyword
                        }
                    },
                    _source: ['tokenId', 'questionContent', 'image', 'nationality', 'grade']
                }
            });

            if (nftBody.hits.hits.length > 0) {
                const nftDetails = nftBody.hits.hits[0]._source;
                return {
                    keyword,
                    count: keywordBody.aggregations.top_keywords.buckets.find(bucket => bucket.key === keyword).doc_count,
                    nftDetails
                };
            }

            return null;
        });

        const popularNFTs = await Promise.all(nftPromises);
        return popularNFTs.filter(nft => nft !== null);
    } catch (error) {
        console.error('Error fetching popular NFTs:', error);
        throw error;
    }
};

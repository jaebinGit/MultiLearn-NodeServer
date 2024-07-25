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

// 인기 NFT 조회
export const fetchPopularNFTs = async () => {
    try {
        const { body } = await esClient.search({
            index: 'nfts',
            size: 0,
            body: {
                aggs: {
                    top_keywords: {
                        terms: {
                            field: 'search_keywords.keyword',
                            size: 3
                        },
                        aggs: {
                            top_nfts: {
                                top_hits: {
                                    size: 1,
                                    _source: {
                                        includes: ['tokenId', 'questionContent', 'image', 'nationality', 'grade']
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return body.aggregations.top_keywords.buckets.map(bucket => {
            const nftDetails = bucket.top_nfts.hits.hits[0]._source;
            return {
                keyword: bucket.key,
                count: bucket.doc_count,
                nftDetails
            };
        });
    } catch (error) {
        console.error('Error fetching popular NFTs:', error);
        throw error;
    }
};
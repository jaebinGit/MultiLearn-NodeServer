import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const { ELASTICSEARCH_NODE } = process.env;

const esClient = new Client({
    node: ELASTICSEARCH_NODE,
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: false,
    apiVersion: '7.17.22',
    ssl: false
});

export default esClient;

async function setupElasticsearch() {
    try {
        await esClient.indices.create({
            index: 'nfts',
            body: {
                settings: {
                    number_of_shards: 1,
                    number_of_replicas: 0,
                    analysis: {
                        tokenizer: {
                            kuromoji_tokenizer: {
                                type: 'kuromoji_tokenizer'
                            },
                            nori_tokenizer: {
                                type: 'nori_tokenizer'
                            },
                            smartcn_tokenizer: {
                                type: 'smartcn_tokenizer'
                            }
                        },
                        analyzer: {
                            multilingual_analyzer: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: [
                                    'lowercase',
                                    'nori_readingform',
                                    'nori_part_of_speech',
                                    'kuromoji_baseform',
                                    'kuromoji_part_of_speech',
                                    'cjk_width',
                                    'english_stop'
                                ]
                            },
                            japanese_analyzer: {
                                type: 'custom',
                                tokenizer: 'kuromoji_tokenizer',
                                filter: [
                                    'kuromoji_baseform',
                                    'kuromoji_part_of_speech',
                                    'cjk_width',
                                    'lowercase',
                                    'kuromoji_stemmer'
                                ]
                            },
                            korean_analyzer: {
                                type: 'custom',
                                tokenizer: 'nori_tokenizer',
                                filter: [
                                    'nori_readingform',
                                    'nori_part_of_speech',
                                    'lowercase'
                                ]
                            },
                            chinese_analyzer: {
                                type: 'custom',
                                tokenizer: 'smartcn_tokenizer',
                                filter: [
                                    'lowercase'
                                ]
                            }
                        }
                    }
                },
                mappings: {
                    properties: {
                        tokenId: { type: 'keyword' },
                        nationality: { type: 'keyword' },
                        grade: { type: 'keyword' },
                        questionContent: { type: 'text', analyzer: 'multilingual_analyzer' },
                        answerContent: { type: 'text', analyzer: 'multilingual_analyzer' },
                        image: { type: 'text' }
                    }
                }
            }
        });
        console.log('Elasticsearch index created');
    } catch (error) {
        if (error.meta && error.meta.body && error.meta.body.error && error.meta.body.error.type !== 'resource_already_exists_exception') {
            console.error('Failed to create Elasticsearch index:', error);
        } else {
            console.log('Elasticsearch index already exists');
        }
    }
}

export { setupElasticsearch };
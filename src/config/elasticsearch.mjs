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
                    number_of_replicas: 0
                },
                mappings: {
                    properties: {
                        tokenId: { type: 'keyword' },
                        nationality: { type: 'keyword' },
                        grade: { type: 'keyword' },
                        questionContent: { type: 'text' },
                        answerContent: { type: 'text' },
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
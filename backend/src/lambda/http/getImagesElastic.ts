import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getHeaders } from '../utils'

import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

import { createLogger } from '../../utils/logger';

const logger = createLogger('image-get-es-list')

const esHost = process.env.ELASTICSEARCH_URL
const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const queryWord = event.queryStringParameters["query"]
    const userId = event.requestContext.authorizer.principalId;
    const result = await es.search({
        index: 'image-index',

        body: {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "description": queryWord
                            }
                        },
                        {
                            "match": {
                                "userId": userId
                            }
                        }
                    ]
                }
            }
        }
    })

    let items = []
    try {
        logger.info("get elasticsearch images success")
        let response = result.hits.hits;
        for (const item of response) {
            items.push(item._source)
        }
    } catch (error) {
        logger.error(error)
        items = []
    }

    return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
            items
        })
    }
}
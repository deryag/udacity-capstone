import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { getHeaders } from '../utils'
import { createLogger } from '../../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const imagesTable = process.env.IMAGES_TABLE;
const indexName = process.env.INDEX_UI_CD_NAME;

const logger = createLogger('image-get-list')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer.principalId;

  const result = await docClient.query({
    TableName: imagesTable,
    IndexName: indexName,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }).promise();

  const items = result.Items;

  logger.info("get images success")

  return {
    statusCode: 200,
    headers: getHeaders(),
    body: JSON.stringify({
      items
    })
  }
}

import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { getHeaders } from '../utils'
import { createLogger } from '../../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('image-upload-url')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const imageId = event.pathParameters.imageId
  const description = event.body;

  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration,
    Metadata: { description: description},
  })

  logger.info("generate upload url success")

  return {
    statusCode: 202,
    headers: getHeaders(),
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  };
}

import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { CreateImageRequest } from '../../requests/CreateImageRequest'
import { createImage } from '../../businessLayer/Image'
import { createLogger } from '../../utils/logger'
import { getHeaders, getUserId } from '../utils'
import * as uuid from 'uuid'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('image-create')
const snsArn = process.env.SNS_ARN_CREATE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {
    const userId = getUserId(event);
    const newImage: CreateImageRequest = JSON.parse(event.body)

    let imageRequest = {
      id: uuid.v4(),
      userId,
      name: newImage.name,
      description: newImage.description,
      filter: newImage.filter
    }

    logger.info(imageRequest)

    const newImageResponse = await createImage(imageRequest)

    logger.info("image creation success")

    const snsClient = new XAWS.SNS();
    var params = {
      Message: JSON.stringify(newImageResponse),
      Subject: "[IMAGE-CREATION]",
      TopicArn: snsArn
    };

    await snsClient.publish(params).promise();

    logger.info("image creation SNS publish success")

    return {
      statusCode: 201,
      headers: getHeaders(),
      body: JSON.stringify({
        item: newImageResponse
      })
    }
  } catch (error) {
    logger.error(error)

    return {
      statusCode: 500,
      headers: getHeaders(),
      body: "Failed to save image"
    }
  }
}

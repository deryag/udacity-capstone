import { SNSEvent, SNSHandler } from 'aws-lambda'

import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

import { createLogger } from '../../utils/logger'

const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

const esHost = process.env.ELASTICSEARCH_URL

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
})

const logger = createLogger('image-update-es')

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info(`Processing SNS event ${JSON.stringify(event)}`)
    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message
        const s3Event = JSON.parse(s3EventStr)
        for (const record of s3Event.Records) {
            const key = record.s3.object.key

            const imageId = key.substr(0, key.indexOf('.jpeg'))
            logger.info(`Processing item with key: ${imageId}`);

            await es.update({
                index: 'image-index',
                type: 'images',
                id: `${imageId}`,
                body: {
                    doc: {
                        processDate: new Date().toISOString(),
                        processed: true,
                        uploadUrl: `https://${thumbnailBucketName}.s3.amazonaws.com/${imageId}.jpeg`
                    }
                }
            })

            logger.info(`elasticsearch update success with key: ${imageId}`)
        }
        await es.indices.refresh({ index: 'image-index' })
    }
}
import { SNSEvent, SNSHandler } from 'aws-lambda'

import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

import { createLogger } from '../../utils/logger'

const esHost = process.env.ELASTICSEARCH_URL

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
})

const logger = createLogger('image-create-es')

export const handler: SNSHandler = async (event: SNSEvent) => {
    for (const snsRecord of event.Records) {
        const image = JSON.parse(snsRecord.Sns.Message)

        await es.index({
            index: 'image-index',
            type: 'images',
            id: image.id,
            body: {
                userId: image.userId,
                id: image.id,
                createdDate: image.createdDate,
                name: image.name,
                description: image.description,
                processed: image.processed,
                processDate: image.processDate,
                uploadUrl: image.uploadUrl,
                filter: image.filter
            }
        })

        logger.info(`elasticsearch create success with id: ${image.id}`)
    }
    await es.indices.refresh({ index: 'image-index' })
}
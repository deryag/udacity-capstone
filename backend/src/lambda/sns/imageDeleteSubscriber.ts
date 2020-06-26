import { SNSEvent, SNSHandler } from 'aws-lambda'

import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

import { createLogger } from '../../utils/logger'

const esHost = process.env.ELASTICSEARCH_URL

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
})

const logger = createLogger('image-delete-es')

export const handler: SNSHandler = async (event: SNSEvent) => {
    for (const snsRecord of event.Records) {
        const image = JSON.parse(snsRecord.Sns.Message)

        logger.info(`Processing item with key: ${image.id}`)

        await es.delete({
            index: 'image-index',
            type: 'images',
            id: image.id
        })

        logger.info(`elasticsearch delete success with id: ${image.id}`)
    }
    await es.indices.refresh({ index: 'image-index' })
}
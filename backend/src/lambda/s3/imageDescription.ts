import { SNSEvent, SNSHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import Jimp from 'jimp/es'
import { getImage, updateUploadUrl, setProcessed } from '../../businessLayer/Image';
import { createLogger } from '../../utils/logger'

const s3 = new AWS.S3()
const imagesBucketName = process.env.IMAGES_S3_BUCKET
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

const logger = createLogger('image-description')

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info(`Processing SNS event ${JSON.stringify(event)}`)
    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message
        const s3Event = JSON.parse(s3EventStr)
        for (const record of s3Event.Records) {
            await processImage(record)
        }
    }
}

async function processImage(record) {
    const key = record.s3.object.key
    logger.info(`Processing S3 item with key: ${key}`)

    const response = await s3
        .getObject({
            Bucket: imagesBucketName,
            Key: key
        })
        .promise()
        key.imageItem
    
    const imgRecord = await getImage(key)
    const body = response.Body as Buffer
    const image = await Jimp.read(body)
    const filter = response.Metadata['filter']
    
    logger.info('image filter :' + filter)
    if(imgRecord.filter.toString() == 'grayscale'){
        logger.info('image filter :' + filter)
        image.resize(640, Jimp.AUTO).quality(60).grayscale()
    }
    if(imgRecord.filter.toString() == 'sepia'){
        logger.info('image filter :' + filter)
        image.resize(640, Jimp.AUTO).sepia()
    }
    if(imgRecord.filter.toString() == 'posterize'){
        logger.info('image filter :' + filter)
        image.resize(640, Jimp.AUTO).posterize(4)
    }
    if(imgRecord.filter.toString() == 'contrast'){
        logger.info('image filter :' + filter)
        image.resize(640, Jimp.AUTO).contrast(0.5)   
    }
    if(imgRecord.filter.toString() == 'invert'){
        logger.info('image filter :' + filter)
        image.resize(640, Jimp.AUTO).invert()   
    }
    
    const convertedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)

    logger.info(`image description success with key: ${key}`)

    await s3
        .putObject({
            Bucket: thumbnailBucketName,
            Key: `${key}.jpeg`,
            Body: convertedBuffer
        })
        .promise()

    logger.info(`thumbnail image upload success with key: ${key}`)

    const imageItem = await getImage(key)

    await updateUploadUrl(imageItem.id, imageItem.userId, `https://${thumbnailBucketName}.s3.amazonaws.com/${key}.jpeg`)
    logger.info(`db image update upload url success with id: ${imageItem.id}`)

    await setProcessed(imageItem.id, imageItem.userId);
    logger.info(`db image set processed success with id: ${imageItem.id}`)
}
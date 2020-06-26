import { ImageAccess } from '../dataLayer/imageAccess'
import { ImageItem } from '../models/ImageItem'

const imageAccess = new ImageAccess();
const bucketName = process.env.IMAGES_S3_BUCKET;

export async function createImage(image): Promise<ImageItem> {
    image.createdDate = new Date().toISOString()
    image.processed = false
    image.processDate = ''
    image.uploadUrl = `https://${bucketName}.s3.amazonaws.com/${image.id}`
    //image.filter = ''
    return await imageAccess.createImage(image);
}

export async function getImage(imageId: String) {
    const result = await imageAccess.getImageById(imageId)
    return result[0]
}

export async function getImages(userId: String) {
    return await imageAccess.getImages(userId)
}

export async function deleteImage(imageId: String, userId: String) {
    return await imageAccess.deleteImage(imageId, userId)
}

export async function updateUploadUrl(imageId: String, userId: String, uploadUrl: String) {
    return await imageAccess.updateUploadUrl(imageId, userId, uploadUrl)
}

export async function setProcessed(imageId: String, userId: String) {
    return await imageAccess.setProcessed(imageId, userId, new Date().toISOString())
}
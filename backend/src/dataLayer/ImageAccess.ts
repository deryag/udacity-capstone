import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { ImageItem } from '../models/ImageItem'

const XAWS = AWSXRay.captureAWS(AWS)

function createDynamoDBClient() {
    return new XAWS.DynamoDB.DocumentClient()
}

export class ImageAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly imagesTable = process.env.IMAGES_TABLE,
        private readonly indexUserIdCreatedDateName = process.env.INDEX_UI_CD_NAME,
        private readonly indexIdName = process.env.INDEX_ID_NAME
    ) { }

    async createImage(imageItem: ImageItem): Promise<ImageItem> {
        await this.docClient.put({
            TableName: this.imagesTable,
            Item: imageItem
        }).promise()

        return imageItem
    }

    async getImages(userId: String): Promise<ImageItem[]> {
        const result = await this.docClient.query({
            TableName: this.imagesTable,
            IndexName: this.indexUserIdCreatedDateName,
            KeyConditionExpression: '#userId = :userId',
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const items = result.Items
        return items as ImageItem[]
    }

    async getImageById(id: String): Promise<ImageItem[]> {
        const result = await this.docClient.query({
            TableName: this.imagesTable,
            IndexName: this.indexIdName,
            KeyConditionExpression: '#id = :id',
            ExpressionAttributeNames: {
                "#id": "id"
            },
            ExpressionAttributeValues: {
                ':id': id
            }
        }).promise();

        const items = result.Items
        return items as ImageItem[]
    }

    async deleteImage(imageId: String, userId: String) {
        await this.docClient.delete({
            TableName: this.imagesTable,
            Key: {
                id: imageId,
                userId: userId
            }
        }).promise();
    }

    async updateUploadUrl(imageId: String, userId: String, uploadUrl: String) {
        var params = {
            TableName: this.imagesTable,
            TableIndex: this.indexUserIdCreatedDateName,
            Key: {
                id: imageId,
                userId: userId
            },
            UpdateExpression: "set #uploadUrl = :a",
            ExpressionAttributeNames: {
                '#uploadUrl': 'uploadUrl'
            },
            ExpressionAttributeValues: {
                ":a": uploadUrl
            },
            ReturnValues: "ALL_NEW"
        };
        await this.docClient.update(params).promise();
    }

    async setProcessed(imageId: String, userId: String, processDate: String) {
        var params = {
            TableName: this.imagesTable,
            TableIndex: this.indexUserIdCreatedDateName,
            Key: {
                id: imageId,
                userId: userId
            },
            UpdateExpression: "set #processed = :a, #processDate = :processDate",
            ExpressionAttributeNames: {
                '#processed': 'processed',
                '#processDate': 'processDate'
            },
            ExpressionAttributeValues: {
                ':a': true,
                ':processDate': processDate
            },
            ReturnValues: "ALL_NEW"
        };
        await this.docClient.update(params).promise();
    }
}
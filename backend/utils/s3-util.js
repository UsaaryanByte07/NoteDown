const { s3Client } = require("../config/s3_config");
const { PutObjectCommand, DeleteObjectCommand} = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const fs = require('fs');
dotenv.config();

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

const uploadS3 = async (filePath, key, contentType) => {
    const fileStream = fs.createReadStream(filePath );
     
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: contentType
    });

    await s3Client.send(command);

    const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

    return { url, key };
}

const deleteS3 = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });

    await s3Client.send(command);
}

module.exports = {
    uploadS3,
    deleteS3
}


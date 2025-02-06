const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY, region: process.env.AWS_REGION });
const s3 = new AWS.S3();

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description generates S3 signed url
 */
exports.getSignedUrl = async (req, res) => {
    const { bucketName, fileName } = req.body;
    const urlExpiryTime = 600000; // 10 mins

    const payload = {
        Bucket: bucketName,
        Key: fileName,
        Expires: urlExpiryTime
    }

    s3.getSignedUrl('putObject', payload, (err, url) => {

        if (err) {
            return res.status(400).json({
                log: err,
                error: "Unknown error"
            })
        }

        return res.status(200).json({
            url: url,
            message: "Presigned URL generated"
        })

    });

};

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description deletes images from S3 bucket
 */
exports.deleteImagesFromS3 = (images, bucketName) => {
    return new Promise((resolve, reject) => {

        // Extract keys from image urls
        const objectKeys = images?.map((url) => ({ Key: getS3KeyFromUrl(url) }));

        if (objectKeys.length > 0) {
            const deleteParams = {
                Bucket: bucketName,
                Delete: {
                    Objects: objectKeys
                }
            };
            s3.deleteObjects(deleteParams, (err, data) => {
                if (err) {
                    reject(err)
                }
                resolve(data)
            });
        }
        reject(null)
    })
}

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description gets image key from S3 url
 */
const getS3KeyFromUrl = (url) => {
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/');
};

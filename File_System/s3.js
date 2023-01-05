const express = require('express');
const router = express.Router();
const multer = require('multer');
const PUtObjectCommand = require("aws-sdk/clients/s3");
const S3 = require("aws-sdk/clients/s3");
const AWS = require("aws-sdk")


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const s3Bucket = 'miniamazon' || S3_BUCKET
const s3Region = "ap-south-1"
const s3AccessKeyId = 'AKIAUPTF3VH3BDDEVEOW' || S3_ACCESS_KEY_ID
const s3SecreteAccessKey = '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' || S3_SECRETE_ACCESS_KEY



AWS.config.update({
    s3Region: s3Region,
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecreteAccessKey
});

const s3 = new AWS.S3()

router.post("/single", upload.single('img'), async (req, res) => {
    try {
        const params = {
            Bucket: s3Bucket,
            Key: req.file.originalname,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        };
        return await s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);
        });
    } catch (error) {
        console.log('error: ', error);
    }
});


module.exports = router;
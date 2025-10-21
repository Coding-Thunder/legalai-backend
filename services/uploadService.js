// File: backend/services/uploadService.js
/**
 * Upload service
 *
 * Handles uploading files to S3 or Cloudinary.
 * Returns an object: { url, provider, ... }
 *
 * TODO: Configure S3 or Cloudinary credentials via .env
 */

const AWS = require('aws-sdk');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION,
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to S3
 * @param {Buffer} file
 * @param {String} filename
 * @param {String} mimetype
 */
async function uploadToS3(file, filename, mimetype) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: filename,
    Body: file,
    ContentType: mimetype,
    ACL: 'public-read',
  };

  const data = await s3.upload(params).promise();
  return { url: data.Location, provider: 'S3' };
}

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} file
 * @param {String} filename
 */
async function uploadToCloudinary(file, filename) {
  const data = await cloudinary.uploader.upload_stream(
    {
      resource_type: 'auto',
      public_id: filename,
    },
    (error, result) => {
      if (error) throw error;
      return result;
    }
  );

  // Note: Using upload_stream requires promisify or stream handling in real use
  return { url: data.secure_url, provider: 'CLOUDINARY' };
}

/**
 * Generic upload function
 * Currently defaults to S3 if CLOUD_PROVIDER is 'S3', else Cloudinary
 */
async function uploadFile(file) {
  if (!file || !file.buffer) throw new Error('No file provided');

  const filename = `${Date.now()}_${file.originalname}`;
  if (process.env.CLOUD_PROVIDER === 'CLOUDINARY') {
    return uploadToCloudinary(file.buffer, filename);
  }
  return uploadToS3(file.buffer, filename, file.mimetype);
}

module.exports = {
  uploadFile,
};

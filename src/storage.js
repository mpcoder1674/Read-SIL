const { randomUUID } = require("node:crypto");
const path = require("node:path");
const cloudinary = require("cloudinary").v2;
const { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const provider = String(process.env.FILE_STORAGE_PROVIDER || "none").toLowerCase();
const s3 = provider === "s3" ? new S3Client({ region: process.env.AWS_REGION || "ap-south-1" }) : null;

if (provider === "cloudinary") {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function providerStatus() {
  if (provider === "cloudinary") {
    const configured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
    return { provider, configured };
  }
  if (provider === "s3") return { provider, configured: Boolean(process.env.AWS_S3_BUCKET && process.env.AWS_REGION) };
  return { provider: "none", configured: false };
}

function requireConfiguredProvider() {
  const status = providerStatus();
  if (!status.configured) {
    const error = new Error(status.provider === "none" ? "Set FILE_STORAGE_PROVIDER to cloudinary or s3 and add its credentials in .env to upload book covers." : `The ${status.provider} storage settings are incomplete. Check .env.`);
    error.status = 503;
    throw error;
  }
}

function safeFilename(originalname) {
  return path.basename(originalname || "cover").replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 90) || "cover";
}

async function uploadCover(file, bookId) {
  requireConfiguredProvider();
  if (provider === "cloudinary") {
    const publicId = `readasil/book-covers/${bookId}-${randomUUID()}`;
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
        transformation: [{ width: 900, height: 1200, crop: "limit" }, { quality: "auto", fetch_format: "auto" }],
      }, (error, uploaded) => error ? reject(error) : resolve(uploaded));
      stream.end(file.buffer);
    });
    return { url: result.secure_url, key: "", publicId: result.public_id };
  }
  const key = `book-covers/${bookId}/${randomUUID()}-${safeFilename(file.originalname)}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentLength: file.size,
    ContentType: file.mimetype,
    CacheControl: "public, max-age=3600",
  }));
  return { url: "", key, publicId: "" };
}

async function removeCover({ key, publicId }) {
  if (!key && !publicId) return;
  try {
    if (provider === "cloudinary" && publicId && providerStatus().configured) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
    } else if (provider === "s3" && key && providerStatus().configured) {
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
    }
  } catch (error) {
    console.error("Could not remove the previous book cover:", error.message);
  }
}

async function coverUrl(book) {
  if (book.cover_url) return book.cover_url;
  if (book.cover_storage_key && provider === "s3" && providerStatus().configured) {
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: book.cover_storage_key }), { expiresIn: 3600 });
  }
  return "";
}

module.exports = { providerStatus, requireConfiguredProvider, uploadCover, removeCover, coverUrl };

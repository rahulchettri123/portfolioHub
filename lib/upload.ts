import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client with environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.AWS_S3_BUCKET || "portfolio-rahul123";

/**
 * Upload a file to Amazon S3
 * @param file The file to upload
 * @param key The S3 key/path for the file
 * @returns The URL of the uploaded file
 */
export async function uploadFileToS3(file: File, key: string): Promise<string> {
  if (!s3Client || !bucketName) {
    throw new Error("S3 is not configured. Check your environment variables.");
  }

  console.log(`📤 Uploading to S3: ${key}`);
  
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: file.type,
    });
    
    await s3Client.send(command);
    
    // Return the URL to the file
    return `https://${bucketName}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
} 
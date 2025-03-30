import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client with environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'portfolio-rahul123';

// Generate a presigned URL for file uploads
export async function getPresignedUploadUrl(
  fileName: string, 
  contentType: string,
  expiresIn: number = 60 // URL expires in 60 seconds by default
): Promise<{ url: string; key: string }> {
  const key = `projects/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  try {
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    // Calculate what the final URL will be after upload
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    
    return {
      url: presignedUrl, // URL to upload to
      key: key,          // S3 object key
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

export { s3Client, BUCKET_NAME }; 
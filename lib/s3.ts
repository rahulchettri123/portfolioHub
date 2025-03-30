import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client with environment variables
const s3Client = new S3Client({
  region: process.env.AWS_regioned || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_key_id || '',
    secretAccessKey: process.env.AWS_secret_key || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'portfolio-rahul123';

export async function uploadToS3(file: Buffer, fileName: string, contentType: string): Promise<string> {
  const key = `projects/${Date.now()}-${fileName}`;
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_regioned || 'us-east-1'}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    if (error.Code === 'AccessDenied') {
      console.error('S3 Access Denied. Please check your IAM permissions.');
    }
    throw error;
  }
}

export async function deleteFromS3(imageUrl: string): Promise<void> {
  // Extract the key from the URL
  // URL format could be:
  // https://bucket-name.s3.amazonaws.com/key
  // or
  // https://bucket-name.s3.region.amazonaws.com/key
  let key;
  if (imageUrl.includes('.s3.amazonaws.com/')) {
    key = imageUrl.split('.s3.amazonaws.com/')[1];
  } else {
    // Format with region included
    const parts = imageUrl.split('.amazonaws.com/');
    if (parts.length > 1) {
      key = parts[1];
    }
  }
  
  if (!key) {
    console.error('Invalid S3 URL format:', imageUrl);
    return;
  }
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
    console.log('Successfully deleted file from S3:', key);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
}

export { s3Client }; 
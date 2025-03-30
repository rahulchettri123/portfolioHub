import { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_regioned || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_key_id || '',
    secretAccessKey: process.env.AWS_secret_key || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'portfolio-rahul123';

// This function helps apply a public read policy to the bucket
// ONLY run this once and outside of your regular app flow (e.g., a setup script)
export async function setupBucketPolicy() {
  try {
    // Define a policy that allows public read access to objects in the bucket
    const publicReadPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };

    // Apply the policy to the bucket
    const putPolicyCommand = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(publicReadPolicy),
    });

    await s3Client.send(putPolicyCommand);
    console.log('Successfully applied public read policy to bucket:', BUCKET_NAME);
    return true;
  } catch (error) {
    console.error('Error applying bucket policy:', error);
    return false;
  }
}

// Get the current bucket policy to check what's set
export async function getBucketPolicy() {
  try {
    const getPolicyCommand = new GetBucketPolicyCommand({
      Bucket: BUCKET_NAME,
    });

    const response = await s3Client.send(getPolicyCommand);
    return response.Policy;
  } catch (error) {
    console.error('Error getting bucket policy:', error);
    return null;
  }
}

export { s3Client, BUCKET_NAME }; 
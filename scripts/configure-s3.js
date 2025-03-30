// Script to configure S3 bucket for public access
require('dotenv').config();

const { S3Client, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_S3_BUCKET || 'portfolio-rahul123';

async function configureBucket() {
  try {
    console.log(`Configuring bucket: ${bucketName}`);
    
    // Create a policy that allows public read access for objects
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${bucketName}/*`
        }
      ]
    };
    
    const putPolicyCommand = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(policy)
    });
    
    await s3Client.send(putPolicyCommand);
    console.log('Successfully applied public read policy to bucket');
    console.log(JSON.stringify(policy, null, 2));
  } catch (error) {
    console.error('Error configuring bucket:', error);
  }
}

configureBucket(); 
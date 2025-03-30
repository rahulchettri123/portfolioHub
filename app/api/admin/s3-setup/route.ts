import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { S3Client, ListBucketsCommand, HeadBucketCommand, GetBucketPolicyCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";

// Initialize S3 client with environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'portfolio-rahul123';
const REGION = process.env.AWS_REGION || 'us-east-1';

// GET: Check S3 status
export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Default status
    let isConfigured = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
    let canListBuckets = false;
    let bucketExists = false;
    let bucketPolicy = null;
    
    // Check if we can list buckets (test credentials)
    try {
      const listCommand = new ListBucketsCommand({});
      const { Buckets } = await s3Client.send(listCommand);
      canListBuckets = true;
    } catch (error) {
      console.error("Error listing buckets:", error);
    }
    
    // Check if the bucket exists
    try {
      const headCommand = new HeadBucketCommand({ Bucket: BUCKET_NAME });
      await s3Client.send(headCommand);
      bucketExists = true;
    } catch (error) {
      console.error("Error checking bucket:", error);
    }
    
    // Check if bucket has policy
    if (bucketExists) {
      try {
        const policyResult = await getBucketPolicy();
        bucketPolicy = policyResult;
      } catch (error) {
        console.error("Error getting bucket policy:", error);
      }
    }
    
    return NextResponse.json({
      isConfigured,
      canListBuckets,
      bucketExists,
      bucketPolicy,
      bucketCors: false, // Would require a separate check
      region: REGION,
      bucketName: BUCKET_NAME
    });
  } catch (error) {
    console.error("Error checking S3 status:", error);
    return NextResponse.json({ error: "Failed to check S3 status" }, { status: 500 });
  }
}

// POST: Configure S3 bucket
export async function POST() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // First check if bucket exists
    try {
      const headCommand = new HeadBucketCommand({ Bucket: BUCKET_NAME });
      await s3Client.send(headCommand);
    } catch (error) {
      return NextResponse.json({ 
        error: `Bucket ${BUCKET_NAME} does not exist or cannot be accessed` 
      }, { status: 400 });
    }
    
    // Apply bucket policy for public read access
    try {
      await setupBucketPolicy();
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error applying bucket policy:", error);
      return NextResponse.json({ 
        error: "Failed to apply bucket policy. Check IAM permissions."
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error configuring S3:", error);
    return NextResponse.json({ error: "Failed to configure S3" }, { status: 500 });
  }
}

// Helper function to apply public read bucket policy
async function setupBucketPolicy() {
  // Create a policy that allows public read access for objects
  // This works even with Object Ownership set to "Bucket owner enforced"
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
      }
    ]
  };
  
  const putPolicyCommand = new PutBucketPolicyCommand({
    Bucket: BUCKET_NAME,
    Policy: JSON.stringify(policy)
  });
  
  await s3Client.send(putPolicyCommand);
  console.log('Successfully applied public read policy to bucket:', BUCKET_NAME);
  return true;
}

// Helper function to get bucket policy
async function getBucketPolicy() {
  try {
    const getPolicyCommand = new GetBucketPolicyCommand({
      Bucket: BUCKET_NAME
    });
    
    const response = await s3Client.send(getPolicyCommand);
    return response.Policy;
  } catch (error) {
    console.error('Error getting bucket policy:', error);
    return null;
  }
} 
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Initialize S3 client with environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'portfolio-rahul123';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Create S3 upload parameters
    const key = `projects/${uniqueFilename}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type
    };
    
    // Upload to S3
    await s3Client.send(new PutObjectCommand(params));
    
    // Construct the S3 URL
    const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    console.log("S3 upload successful:", imageUrl);
    
    // Save to the database
    const image = await prisma.image.create({
      data: {
        url: imageUrl,
        filename: file.name,
        storageType: "s3"
      }
    });

    return NextResponse.json({ 
      success: true, 
      image: {
        id: image.id,
        url: image.url,
        filename: image.filename,
        storageType: "s3"
      }
    });
  } catch (error) {
    console.error("S3 upload error:", error);
    return NextResponse.json({ 
      error: "Failed to upload to S3. Please check your AWS credentials and permissions.", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
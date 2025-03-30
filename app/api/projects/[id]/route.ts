import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { unlink } from "fs/promises"
import path from "path"
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"

// Initialize S3 client with environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'portfolio-rahul123';

// GET a specific project
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Find the user ID based on the session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
        userId: user.id // Ensure the project belongs to this user
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

// Function to delete image from S3
async function deleteS3Image(imageUrl: string) {
  try {
    // Extract the key from the URL
    // URL format: https://bucket-name.s3.region.amazonaws.com/key
    const urlParts = imageUrl.split('.amazonaws.com/');
    if (urlParts.length < 2) return;
    
    const key = urlParts[1];
    
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log('Successfully deleted S3 image:', key);
  } catch (error) {
    console.error('Error deleting S3 image:', error);
    // Continue even if deletion fails
  }
}

// Function to delete image based on storage type
async function deleteImage(imageUrl: string) {
  if (!imageUrl) return;
  
  if (imageUrl.includes('.amazonaws.com/')) {
    // S3 image
    await deleteS3Image(imageUrl);
  } else if (imageUrl.startsWith('/uploads/')) {
    // Local image (legacy support)
    try {
      const fileName = imageUrl.split('/uploads/')[1];
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      await unlink(filePath);
      console.log('Successfully deleted local image file:', filePath);
    } catch (deleteError) {
      console.error("Error deleting local image file:", deleteError);
      // Continue even if deletion fails
    }
  }
}

// PUT (update) a project
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Find the user ID based on the session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json()
    
    // Log the received data for debugging
    console.log("Updating project with data:", JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.title || !data.description || !data.startDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, or startDate" },
        { status: 400 }
      );
    }
    
    // Find the existing project to check if we need to delete old images
    const existingProject = await prisma.project.findUnique({
      where: { 
        id: params.id,
        userId: user.id // Ensure the project belongs to this user
      }
    });
    
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found or does not belong to you" }, { status: 404 });
    }
    
    // Prepare date fields
    const startDate = new Date(data.startDate);
    let endDate = null;
    if (data.endDate && !data.current) {
      endDate = new Date(data.endDate);
    }
    
    // Process images array
    let images = [];
    if (Array.isArray(data.images)) {
      // Only include valid image URLs
      images = data.images.filter(
        (url: string) => url && (
          url.startsWith('http') || 
          url.startsWith('https') || 
          url.includes('amazonaws.com') || 
          url.startsWith('/uploads/')
        )
      );
    }
    
    // Process lessonsLearned array
    let lessonsLearned = [];
    if (Array.isArray(data.lessonsLearned)) {
      lessonsLearned = data.lessonsLearned;
    }
    
    // Check for images to delete
    if (existingProject.images && Array.isArray(existingProject.images)) {
      // Find images that are in the existing project but not in the updated data
      const imagesToDelete = existingProject.images.filter(
        oldImage => !images.includes(oldImage)
      );
      
      // Delete each image that is no longer needed
      for (const imageUrl of imagesToDelete) {
        await deleteImage(imageUrl);
      }
    }

    const project = await prisma.project.update({
      where: {
        id: params.id,
        userId: user.id // Ensure the project belongs to this user
      },
      data: {
        title: data.title,
        description: data.description,
        location: data.location || "",
        startDate: startDate,
        endDate: endDate,
        current: data.current || false,
        images: images,
        lessonsLearned: lessonsLearned,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

// DELETE a project
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Find the user ID based on the session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Find the project to get the images before deletion
    const project = await prisma.project.findUnique({
      where: { 
        id: params.id,
        userId: user.id // Ensure the project belongs to this user
      }
    });
    
    if (!project) {
      return NextResponse.json({ error: "Project not found or does not belong to you" }, { status: 404 });
    }
    
    // Delete the project from the database
    await prisma.project.delete({
      where: {
        id: params.id,
        userId: user.id // Ensure the project belongs to this user
      },
    })
    
    // Delete all images associated with the project
    if (project.images && Array.isArray(project.images)) {
      for (const imageUrl of project.images) {
        await deleteImage(imageUrl);
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}

// Check if the file exists


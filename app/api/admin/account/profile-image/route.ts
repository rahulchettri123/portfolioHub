import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { uploadFileToS3 } from "@/lib/upload";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Check for authenticated session
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      console.error("Unauthorized access attempt to image upload");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const uploadType = formData.get("type") as string || "profile"; // Default to profile
    
    if (!file) {
      console.error("No file provided for image upload");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      console.error("Invalid file type for image:", file.type);
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    console.log(`🖼️ Processing ${uploadType} image upload:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Generate a unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    
    // Determine the folder based on upload type
    const uploadFolder = uploadType === "company-logo" ? "company-logos" : "profile-images";
    
    // Upload to S3
    console.log(`🖼️ Uploading ${uploadType} image to S3`);
    const imageUrl = await uploadFileToS3(file, `${uploadFolder}/${fileName}`);
    console.log("🖼️ S3 upload successful:", imageUrl);

    // Save the image reference to the database
    await prisma.image.create({
      data: {
        url: imageUrl,
        filename: fileName,
        storageType: "s3"
      }
    });

    // Only update user profile if it's a profile image
    if (uploadType === "profile") {
      await prisma.user.update({
        where: {
          email: session.user.email
        },
        data: {
          image: imageUrl
        }
      });
      console.log("🖼️ Profile image updated for user:", session.user.email);
    }
    
    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });
  } catch (error) {
    console.error("Error uploading image:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ 
      error: "Failed to upload image to S3. Check your AWS configuration.",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 
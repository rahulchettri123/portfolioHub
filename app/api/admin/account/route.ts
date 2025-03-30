import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET user profile
export async function GET() {
  try {
    // Check for authenticated session
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log("📝 Fetching profile for email:", session.user.email);
    
    // Find the user in the database
    let user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });
    
    console.log("📝 Raw user data from database:", JSON.stringify(user, null, 2));
    
    // If user doesn't exist, create a default user
    if (!user) {
      console.log("📝 User not found, creating default user");
      user = await prisma.user.create({
        data: {
          name: session.user.name || "",
          email: session.user.email,
          password: await bcrypt.hash("password", 10), // Default password
          image: session.user.image || "",
          bio: "",
          title: "",
          location: "",
          githubUrl: "",
          linkedinUrl: "",
          twitterUrl: "",
          websiteUrl: "",
        }
      });
    }
    
    // Transform to the expected format
    const profile = {
      id: user.id,
      name: user.name || "",
      email: user.email,
      bio: user.bio || "",
      title: user.title || "",
      location: user.location || "",
      profileImageUrl: user.image || "",
      socialLinks: {
        github: user.githubUrl || "",
        linkedin: user.linkedinUrl || "",
        twitter: user.twitterUrl || "",
        website: user.websiteUrl || ""
      }
    };
    
    console.log("📝 Account data being sent to client:", JSON.stringify(profile, null, 2));
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// Update user profile
export async function PUT(request: Request) {
  try {
    // Check for authenticated session
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse the request body
    const data = await request.json();
    console.log("📝 Received profile update data:", JSON.stringify(data, null, 2));
    
    // Map the social links to the database fields
    const { socialLinks, ...rest } = data;
    
    // Find user first to check if it exists
    let user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });
    
    let updatedUser;
    
    // If user doesn't exist, create it
    if (!user) {
      console.log("📝 User not found, creating new user record");
      updatedUser = await prisma.user.create({
        data: {
          name: rest.name,
          email: session.user.email,
          password: await bcrypt.hash("password", 10), // Default password
          bio: rest.bio || "",
          title: rest.title || "",
          location: rest.location || "",
          image: rest.profileImageUrl || "",
          githubUrl: socialLinks?.github || "",
          linkedinUrl: socialLinks?.linkedin || "",
          twitterUrl: socialLinks?.twitter || "",
          websiteUrl: socialLinks?.website || "",
          updatedAt: new Date()
        }
      });
    } else {
      // Update the user in the database
      console.log("📝 Updating existing user profile");
      updatedUser = await prisma.user.update({
        where: {
          email: session.user.email
        },
        data: {
          name: rest.name,
          bio: rest.bio || "",
          title: rest.title || "",
          location: rest.location || "",
          image: rest.profileImageUrl || "",
          githubUrl: socialLinks?.github || "",
          linkedinUrl: socialLinks?.linkedin || "",
          twitterUrl: socialLinks?.twitter || "",
          websiteUrl: socialLinks?.website || "",
          updatedAt: new Date()
        }
      });
    }
    
    // Transform back to the expected format for the response
    const profile = {
      id: updatedUser.id,
      name: updatedUser.name || "",
      email: updatedUser.email,
      bio: updatedUser.bio || "",
      title: updatedUser.title || "",
      location: updatedUser.location || "",
      profileImageUrl: updatedUser.image || "",
      socialLinks: {
        github: updatedUser.githubUrl || "",
        linkedin: updatedUser.linkedinUrl || "",
        twitter: updatedUser.twitterUrl || "",
        website: updatedUser.websiteUrl || ""
      }
    };
    
    console.log("📝 Updated profile being sent to client:", JSON.stringify(profile, null, 2));
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating user profile:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET public profile information
export async function GET() {
  try {
    // Find the first user in the database (assuming it's the portfolio owner)
    const user = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Default profile data
    const defaultProfile = {
      name: "Rahul Chettri",
      title: "Full Stack Developer",
      bio: "Passionate about building great web applications",
      location: "San Francisco, CA",
      profileImageUrl: "",
      socialLinks: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
        website: ""
      }
    };
    
    if (!user) {
      return NextResponse.json(
        { 
          error: "Profile not found",
          defaultProfile
        }, 
        { status: 404 }
      );
    }
    
    // Process image URL - ensure it's properly formatted
    let imageUrl = user.image || "";
    
    // If the image is from S3, it will be a full URL, keep it as is
    // If it's a local path starting with /uploads/, it needs to be used as is
    // No additional processing needed for these cases

    // Transform to the expected format for the public profile
    const profile = {
      name: user.name || defaultProfile.name,
      title: user.title || defaultProfile.title,
      bio: user.bio || defaultProfile.bio,
      location: user.location || defaultProfile.location,
      profileImageUrl: imageUrl,
      socialLinks: {
        github: user.githubUrl || defaultProfile.socialLinks.github,
        linkedin: user.linkedinUrl || defaultProfile.socialLinks.linkedin,
        twitter: user.twitterUrl || defaultProfile.socialLinks.twitter,
        website: user.websiteUrl || defaultProfile.socialLinks.website
      }
    };
    
    console.log("Profile data being sent:", JSON.stringify(profile));
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching public profile:", error instanceof Error ? error.message : "Unknown error");
    
    // Return default profile information in case of error
    return NextResponse.json({ 
      error: "Failed to fetch profile",
      defaultProfile: {
        name: "Rahul Chettri",
        title: "Full Stack Developer",
        bio: "Passionate about building great web applications",
        location: "San Francisco, CA",
        profileImageUrl: "",
        socialLinks: {
          github: "https://github.com",
          linkedin: "https://linkedin.com",
          twitter: "https://twitter.com",
          website: ""
        }
      }
    }, { status: 500 });
  }
} 
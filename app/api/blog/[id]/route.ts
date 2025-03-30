import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET a single blog post by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const blogId = params.id;
    
    const blogPost = await prisma.blog.findUnique({
      where: {
        id: blogId,
        userId: user.id // Ensure the blog belongs to this user
      }
    });
    
    if (!blogPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    
    return NextResponse.json(blogPost);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

// UPDATE a blog post
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = params.id;
    
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
    
    const data = await request.json();
    
    // Validate required fields
    if (!data || !data.title || !data.description || !data.eventDate) {
      return NextResponse.json(
        { error: "Missing required fields (title, description, or eventDate)" },
        { status: 400 }
      );
    }
    
    // Check if blog post exists and belongs to the user
    const existingBlogPost = await prisma.blog.findUnique({
      where: {
        id: blogId,
        userId: user.id // Ensure the blog belongs to this user
      }
    });
    
    if (!existingBlogPost) {
      return NextResponse.json({ error: "Blog post not found or does not belong to you" }, { status: 404 });
    }
    
    // Process and validate images array
    let images = [];
    if (Array.isArray(data.images)) {
      // Only include valid image URLs (http, https, or /uploads/)
      images = data.images.filter(
        (url: string) => url && (
          url.startsWith('http') || 
          url.startsWith('https') || 
          url.includes('amazonaws.com') || 
          url.startsWith('/uploads/')
        )
      );
      
      // Limit to 4 images
      images = images.slice(0, 4);
    }
    
    // Update the blog post
    const updatedBlogPost = await prisma.blog.update({
      where: {
        id: blogId,
        userId: user.id // Ensure the blog belongs to this user
      },
      data: {
        title: data.title,
        description: data.description,
        location: data.location || "",
        eventDate: new Date(data.eventDate),
        skillsLearned: Array.isArray(data.skillsLearned) ? data.skillsLearned : [],
        images: images,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(updatedBlogPost);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// DELETE a blog post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = params.id;
    
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
    
    // Check if blog post exists and belongs to the user
    const existingBlogPost = await prisma.blog.findUnique({
      where: {
        id: blogId,
        userId: user.id // Ensure the blog belongs to this user
      }
    });
    
    if (!existingBlogPost) {
      return NextResponse.json({ error: "Blog post not found or does not belong to you" }, { status: 404 });
    }
    
    // Delete the blog post
    await prisma.blog.delete({
      where: {
        id: blogId,
        userId: user.id // Ensure the blog belongs to this user
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: "Blog post deleted successfully",
      id: blogId
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
} 
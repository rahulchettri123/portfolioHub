import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET all blog posts for the current user
export async function GET(request: Request) {
  try {
    // Get the user session
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
    
    const blogPosts = await prisma.blog.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        eventDate: 'desc'
      }
    });
    
    // Simply return the blog posts, even if it's an empty array
    return NextResponse.json(blogPosts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// POST a new blog post
export async function POST(request: Request) {
  try {
    // Check user authentication
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - You must be logged in to create a blog post" },
        { status: 401 }
      );
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
    
    // Create new blog post with user association
    const newBlogPost = await prisma.blog.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location || "",
        eventDate: new Date(data.eventDate),
        skillsLearned: Array.isArray(data.skillsLearned) ? data.skillsLearned : [],
        images: images,
        userId: user.id // Associate with current user
      }
    });
    
    return NextResponse.json(newBlogPost);
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
} 
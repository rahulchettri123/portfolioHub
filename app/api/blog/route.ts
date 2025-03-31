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
    
    // Validate event date
    let eventDate: Date;
    try {
      eventDate = new Date(data.eventDate);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date format");
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid event date format" },
        { status: 400 }
      );
    }
    
    // Validate and sanitize input data
    const validatedData = {
      title: String(data.title).trim(),
      description: String(data.description).trim(),
      location: data.location ? String(data.location).trim() : "",
      eventDate,
      skillsLearned: Array.isArray(data.skillsLearned) 
        ? data.skillsLearned.filter(Boolean).map(item => String(item).trim()) 
        : [],
      // Accept URLs as-is without validation
      url: data.url || '',
      githubUrl: data.githubUrl || '',
      linkedinUrl: data.linkedinUrl || '',
    };
    
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
    try {
      const newBlogPost = await prisma.blog.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          location: validatedData.location,
          eventDate: validatedData.eventDate,
          skillsLearned: validatedData.skillsLearned,
          images: images,
          // Use URLs directly without any validation or conversion
          url: validatedData.url,
          githubUrl: validatedData.githubUrl,
          linkedinUrl: validatedData.linkedinUrl,
          userId: user.id // Associate with current user
        }
      });
      
      return NextResponse.json(newBlogPost);
    } catch (prismaError) {
      console.error("Prisma error creating blog post:", {
        name: prismaError.name,
        code: prismaError.code,
        message: prismaError.message,
        isValidationError: prismaError.name === 'PrismaClientValidationError',
        error: JSON.stringify(prismaError, null, 2)
      });
      
      if (prismaError.name === 'PrismaClientValidationError') {
        // Log all the data to help with debugging
        console.error("Validation Error Details:", {
          validatedData,
          rawData: data,
          error: prismaError.message,
          stackTrace: prismaError.stack
        });
        
        return NextResponse.json(
          { error: `Database validation error. Please contact the administrator with this error code: ${Date.now()}` },
          { status: 400 }
        );
      }
      
      throw prismaError; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error("Error creating blog post:", error);
    // Provide more detailed error messages based on the error type
    let errorMessage = "Failed to create blog post";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === 'PrismaClientKnownRequestError') {
        // This is a Prisma error with a code
        const prismaError = error as any;
        if (prismaError.code === 'P2002') {
          errorMessage = "A blog post with similar unique fields already exists";
          statusCode = 409;
        } else {
          errorMessage = `Database error: ${prismaError.message}`;
        }
      } else {
        // Generic error with message
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
} 
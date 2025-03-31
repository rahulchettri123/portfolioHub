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
    
    // Validate eventDate format
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
      updatedAt: new Date()
    };
    
    console.log("Validated data:", {
      title: validatedData.title.substring(0, 30) + "...",
      description: validatedData.description.substring(0, 30) + "...",
      eventDate: validatedData.eventDate.toISOString(),
      skillsLearned: `${validatedData.skillsLearned.length} skills`,
      url: validatedData.url,
      githubUrl: validatedData.githubUrl,
      linkedinUrl: validatedData.linkedinUrl
    });
    
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
    console.log(`Attempting to update blog post ${blogId} with data:`, {
      title: validatedData.title.substring(0, 30) + '...',
      description: validatedData.description.substring(0, 30) + '...',
      eventDate: validatedData.eventDate.toISOString(),
      skillsLearned: `${validatedData.skillsLearned.length} skills`,
      images: Array.isArray(images) ? `${images.length} images` : 'none',
      userId: user.id
    });
    
    try {
      const updatedBlogPost = await prisma.blog.update({
        where: {
          id: blogId,
          userId: user.id // Ensure the blog belongs to this user
        },
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
          updatedAt: validatedData.updatedAt
        }
      });
      
      console.log("Blog post updated successfully:", updatedBlogPost.id);
      try {
        // Make sure we have a valid response
        const response = NextResponse.json(updatedBlogPost);
        return response;
      } catch (responseError) {
        console.error("Error creating JSON response:", responseError);
        // Fallback to plain text response with stringified JSON
        return new NextResponse(
          JSON.stringify({ 
            id: updatedBlogPost.id,
            success: true,
            message: "Blog post updated successfully" 
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (prismaError) {
      console.error("Prisma error updating blog post:", {
        name: prismaError.name,
        code: prismaError.code,
        message: prismaError.message,
        // Check if it's a validation error
        isValidationError: prismaError.name === 'PrismaClientValidationError',
        // Print the entire error object for debugging
        error: JSON.stringify(prismaError, null, 2)
      });
      
      // Handle validation errors specifically
      if (prismaError.name === 'PrismaClientValidationError') {
        // Check if it's related to URL fields
        const errorMsg = prismaError.message || '';
        
        // Log all the data to help with debugging
        console.error("Validation Error Details:", {
          validatedData,
          rawData: data,
          error: prismaError.message,
          stackTrace: prismaError.stack
        });
        
        return new NextResponse(
          JSON.stringify({ 
            error: `Database validation error. Please contact the administrator with this error code: ${Date.now()}` 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw prismaError; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error("Error updating blog post:", error);
    // Provide more detailed error messages based on the error type
    let errorMessage = "Failed to update blog post";
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      
      if (error.name === 'PrismaClientKnownRequestError') {
        // This is a Prisma error with a code
        const prismaError = error as any;
        if (prismaError.code === 'P2025') {
          errorMessage = "Blog post not found or has been deleted";
          statusCode = 404;
        } else if (prismaError.code === 'P2002') {
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
    
    // Always respond with a valid JSON response
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { 
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
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
    // Provide more detailed error messages based on the error type
    let errorMessage = "Failed to delete blog post";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === 'PrismaClientKnownRequestError') {
        // This is a Prisma error with a code
        const prismaError = error as any;
        if (prismaError.code === 'P2025') {
          errorMessage = "Blog post not found or has been deleted";
          statusCode = 404;
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
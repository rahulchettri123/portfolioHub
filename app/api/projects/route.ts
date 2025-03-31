import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

// GET all projects
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
    
    const projects = await prisma.project.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

// POST a new project
export async function POST(request: Request) {
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

    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return NextResponse.json({ 
        error: "Invalid JSON in request body", 
        details: parseError instanceof Error ? parseError.message : String(parseError) 
      }, { status: 400 });
    }
    
    // Log the received data for debugging
    console.log("Creating project with data:", JSON.stringify(data, null, 2));
    
    // Log specific fields we care about
    console.log("Project githubUrl:", data.githubUrl);
    console.log("Project url:", data.url);
    
    // Validate required fields
    if (!data.title || !data.description || !data.startDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, or startDate" },
        { status: 400 }
      );
    }
    
    // Prepare date fields
    let startDate;
    try {
      startDate = new Date(data.startDate);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid start date format", details: "Please provide a valid date" },
          { status: 400 }
        );
      }
    } catch (dateError) {
      console.error("Error parsing start date:", dateError);
      return NextResponse.json(
        { error: "Invalid start date", details: "Could not parse the provided start date" },
        { status: 400 }
      );
    }
    
    let endDate = null;
    if (data.endDate && !data.current) {
      try {
        endDate = new Date(data.endDate);
        if (isNaN(endDate.getTime())) {
          console.warn("Invalid end date format, setting to null");
          endDate = null;
        }
      } catch (dateError) {
        console.warn("Error parsing end date, setting to null:", dateError);
        endDate = null;
      }
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
    
    // Process lessonsLearned array - ensure it's a string array
    let lessonsLearned = [];
    if (Array.isArray(data.lessonsLearned)) {
      lessonsLearned = data.lessonsLearned.filter(item => typeof item === 'string');
    }
    
    // Process techStack array - ensure it's a string array
    let techStack = [];
    if (Array.isArray(data.techStack)) {
      techStack = data.techStack.filter(item => typeof item === 'string');
    }
    
    // Process tags array - ensure it's a string array
    let tags = [];
    if (Array.isArray(data.tags)) {
      tags = data.tags.filter(item => typeof item === 'string');
    }
    
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location || "",
        startDate: startDate,
        endDate: endDate,
        current: Boolean(data.current),
        images: images,
        lessonsLearned: lessonsLearned,
        techStack: techStack,
        tags: tags,
        url: data.url || "",
        githubUrl: data.githubUrl || "",
        userId: user.id
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error creating project:", error)
    // Log more details about the error for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json({ error: "Failed to create project", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}


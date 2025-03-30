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

    const data = await request.json()
    
    // Log the received data for debugging
    console.log("Creating project with data:", JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.title || !data.description || !data.startDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, or startDate" },
        { status: 400 }
      );
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
    
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location || "",
        startDate: startDate,
        endDate: endDate,
        current: data.current || false,
        images: images,
        lessonsLearned: lessonsLearned,
        userId: user.id
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}


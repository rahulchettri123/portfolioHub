import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET handler to fetch all experiences
export async function GET() {
  try {
    // Get the current session to identify the user
    const session = await getServerSession();
    
    // If no session, return unauthorized
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Find the user ID
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        id: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Fetch experiences for the current user
    const experiences = await prisma.experience.findMany({
      where: {
        userId: user.id
      },
      orderBy: [
        { current: 'desc' },  // current=true first
        { startDate: 'desc' } // then by most recent startDate
      ]
    });

    // If no experiences found, provide default sample experiences
    if (experiences.length === 0) {
      const defaultExperiences = [
        {
          id: "default-1",
          jobTitle: "Senior Data Scientist",
          company: "TechCorp",
          location: "Boston, MA",
          description: "Led machine learning projects for financial services clients. Improved fraud detection models by 25% using deep learning techniques.",
          startDate: new Date("2021-03-01"),
          endDate: null,
          current: true,
          companyLogo: null,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.id
        },
        {
          id: "default-2",
          jobTitle: "Data Scientist",
          company: "AI Solutions Inc",
          location: "Cambridge, MA",
          description: "Developed NLP models for sentiment analysis. Created data pipelines for processing large datasets.",
          startDate: new Date("2019-06-01"),
          endDate: new Date("2021-02-28"),
          current: false,
          companyLogo: null,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.id
        },
        {
          id: "default-3",
          jobTitle: "Research Assistant",
          company: "University Research Lab",
          location: "Boston, MA",
          description: "Assisted in computer vision research. Published 2 papers on object detection algorithms.",
          startDate: new Date("2017-09-01"),
          endDate: new Date("2019-05-30"),
          current: false,
          companyLogo: null,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.id
        }
      ];
      
      return NextResponse.json(defaultExperiences);
    }

    return NextResponse.json(experiences);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}

// POST handler to add a new experience (for admin use)
export async function POST(request: Request) {
  try {
    // Get the current session to identify the user
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Find the user record for the logged in user
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data || !data.jobTitle || !data.company || !data.startDate) {
      return NextResponse.json(
        { error: "Missing required fields (jobTitle, company, or startDate)" },
        { status: 400 }
      );
    }
    
    // Create the new experience with the user association
    const experience = await prisma.experience.create({
      data: {
        jobTitle: data.jobTitle,
        company: data.company,
        location: data.location || "",
        description: data.description || "",
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        current: Boolean(data.current) || false,
        companyLogo: data.companyLogo || null,
        // Associate the experience with the current user
        userId: user.id
      }
    });
    
    return NextResponse.json(experience);
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { error: "Failed to create or save experience" },
      { status: 500 }
    );
  }
} 
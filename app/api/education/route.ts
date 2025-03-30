import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET handler to fetch all education entries
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
    
    // Fetch education sorted by newest first for the current user
    const educations = await prisma.education.findMany({
      where: {
        userId: user.id
      },
      orderBy: [
        { endDate: 'desc' },  // most recent endDate first
        { startDate: 'desc' } // then by most recent startDate
      ]
    });

    // If no education entries found, provide default sample entries
    if (educations.length === 0) {
      const defaultEducations = [
        {
          id: "default-1",
          universityName: "Northeastern University",
          location: "Boston, MA, USA",
          degree: "Master's, Data Science",
          startDate: new Date("2022-09-01"),
          endDate: new Date("2025-05-01"),
          gpa: "3.75",
          logoImageUrl: null,
          courses: [],
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.id
        },
        {
          id: "default-2",
          universityName: "North Bengal University",
          location: "Siliguri, India",
          degree: "Bachelor's, Computer Science",
          startDate: new Date("2019-06-01"),
          endDate: new Date("2022-03-01"),
          gpa: "3.76",
          logoImageUrl: null,
          courses: [],
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.id
        }
      ];
      
      return NextResponse.json(defaultEducations);
    }

    return NextResponse.json(educations);
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education entries" },
      { status: 500 }
    );
  }
}

// POST handler to add a new education entry (for admin use)
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
    if (!data || !data.universityName || !data.degree || !data.startDate) {
      return NextResponse.json(
        { error: "Missing required fields (universityName, degree, or startDate)" },
        { status: 400 }
      );
    }
    
    // Create the new education entry with user association
    const education = await prisma.education.create({
      data: {
        universityName: data.universityName,
        location: data.location || "",
        degree: data.degree,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        gpa: data.gpa || null,
        logoImageUrl: data.logoImageUrl || null,
        courses: data.courses || [],
        order: data.order || 0,
        // Associate the education with the current user
        userId: user.id
      }
    });
    
    return NextResponse.json(education);
  } catch (error) {
    console.error("Error creating education entry:", error);
    return NextResponse.json(
      { error: "Failed to create or save education entry" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET a single experience by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const experienceId = params.id;
    
    const session = await getServerSession();
    
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
    
    // Find experience that belongs to the current user
    const experience = await prisma.experience.findFirst({
      where: {
        id: experienceId,
        userId: user.id
      }
    });
    
    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }
    
    return NextResponse.json(experience);
  } catch (error) {
    console.error("Error fetching experience:", error);
    return NextResponse.json(
      { error: "Failed to fetch experience" },
      { status: 500 }
    );
  }
}

// UPDATE an experience
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const experienceId = params.id;
    
    const session = await getServerSession();
    
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
    
    const data = await request.json();
    
    // Validate required fields
    if (!data || !data.jobTitle || !data.company || !data.startDate) {
      return NextResponse.json(
        { error: "Missing required fields (jobTitle, company, or startDate)" },
        { status: 400 }
      );
    }
    
    // Check if experience exists and belongs to the current user
    const existingExperience = await prisma.experience.findFirst({
      where: {
        id: experienceId,
        userId: user.id
      }
    });
    
    if (!existingExperience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }
    
    // Update the experience
    const updatedExperience = await prisma.experience.update({
      where: {
        id: experienceId
      },
      data: {
        jobTitle: data.jobTitle,
        company: data.company,
        location: data.location || "",
        description: data.description || "",
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        current: Boolean(data.current) || false,
        companyLogo: data.companyLogo || null,
        updatedAt: new Date(),
        // Ensure we keep the same user ID (shouldn't change)
        userId: user.id
      }
    });
    
    return NextResponse.json(updatedExperience);
  } catch (error) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { error: "Failed to update experience" },
      { status: 500 }
    );
  }
}

// DELETE an experience
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the ID from params
    const experienceId = params.id;
    
    // Now we can safely use the ID
    const session = await getServerSession();
    
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
    
    // Check if experience exists and belongs to the current user
    const existingExperience = await prisma.experience.findFirst({
      where: {
        id: experienceId,
        userId: user.id
      }
    });
    
    if (!existingExperience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }
    
    // Delete the experience
    await prisma.experience.delete({
      where: {
        id: experienceId
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: "Experience deleted successfully",
      id: experienceId
    });
  } catch (error) {
    console.error("Error deleting experience:", error);
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Record to delete does not exist")) {
        return NextResponse.json(
          { error: "Experience not found or already deleted" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 }
    );
  }
} 
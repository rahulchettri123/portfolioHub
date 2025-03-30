import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET a single education entry by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const educationId = params.id;
    
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
    
    // Find education that belongs to the current user
    const education = await prisma.education.findFirst({
      where: {
        id: educationId,
        userId: user.id
      }
    });
    
    if (!education) {
      return NextResponse.json({ error: "Education entry not found" }, { status: 404 });
    }
    
    return NextResponse.json(education);
  } catch (error) {
    console.error("Error fetching education entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch education entry" },
      { status: 500 }
    );
  }
}

// UPDATE an education entry
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const educationId = params.id;
    
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
    if (!data || !data.universityName || !data.degree || !data.startDate) {
      return NextResponse.json(
        { error: "Missing required fields (universityName, degree, or startDate)" },
        { status: 400 }
      );
    }
    
    // Check if education entry exists and belongs to the current user
    const existingEducation = await prisma.education.findFirst({
      where: {
        id: educationId,
        userId: user.id
      }
    });
    
    if (!existingEducation) {
      return NextResponse.json({ error: "Education entry not found" }, { status: 404 });
    }
    
    // Update the education entry
    const updatedEducation = await prisma.education.update({
      where: {
        id: educationId
      },
      data: {
        universityName: data.universityName,
        location: data.location || "",
        degree: data.degree,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        gpa: data.gpa || null,
        logoImageUrl: data.logoImageUrl || null,
        courses: data.courses || [],
        updatedAt: new Date(),
        // Ensure we keep the same user ID (shouldn't change)
        userId: user.id
      }
    });
    
    return NextResponse.json(updatedEducation);
  } catch (error) {
    console.error("Error updating education entry:", error);
    return NextResponse.json(
      { error: "Failed to update education entry" },
      { status: 500 }
    );
  }
}

// DELETE an education entry
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the ID from params
    const educationId = params.id;
    
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
    
    // Check if education entry exists and belongs to the current user
    const existingEducation = await prisma.education.findFirst({
      where: {
        id: educationId,
        userId: user.id
      }
    });
    
    if (!existingEducation) {
      return NextResponse.json({ error: "Education entry not found" }, { status: 404 });
    }
    
    // Delete the education entry
    await prisma.education.delete({
      where: {
        id: educationId
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: "Education entry deleted successfully",
      id: educationId
    });
  } catch (error) {
    console.error("Error deleting education entry:", error);
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Record to delete does not exist")) {
        return NextResponse.json(
          { error: "Education entry not found or already deleted" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to delete education entry" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Update security settings (password and email)
export async function PUT(request: Request) {
  try {
    // Check for authenticated session
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse the request body
    const data = await request.json();
    const { currentPassword, newPassword, newEmail } = data;
    
    // Validate input
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }
    
    if (!newPassword && !newEmail) {
      return NextResponse.json({ error: "No changes requested" }, { status: 400 });
    }
    
    // Find user in the database
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password || "");
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    
    // Prepare update data
    const updateData: any = {};
    
    // Hash new password if provided
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }
    
    // Set new email if provided
    if (newEmail) {
      // Check if the new email is already in use
      const existingUser = await prisma.user.findUnique({
        where: {
          email: newEmail
        }
      });
      
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      
      updateData.email = newEmail;
    }
    
    // Update user data
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
    
    // Return success response (without sensitive data)
    return NextResponse.json({
      message: "Security settings updated successfully",
      email: updatedUser.email
    });
    
  } catch (error) {
    console.error("Error updating security settings:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update security settings" }, { status: 500 });
  }
} 
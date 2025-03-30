import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all public projects
export async function GET(request: Request) {
  try {
    // Get query parameters for user filtering
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    // Define the where clause based on userId
    const whereClause = userId 
      ? { userId: userId } 
      : {}; // If no userId is provided, get all public projects
    
    const projects = await prisma.project.findMany({
      where: whereClause,
      orderBy: {
        startDate: 'desc'
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching public projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
} 
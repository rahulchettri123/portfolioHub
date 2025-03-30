import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define paths that require authentication
  const isAdminPath = path.startsWith("/admin")
  const isProtectedApiPath = path.startsWith("/api/admin")

  // Only check authentication for admin paths
  if (isAdminPath || isProtectedApiPath) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Redirect to login if not authenticated
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Get the response
  const response = NextResponse.next()
  
  // Add CORS headers to allow S3 requests
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  
  return response
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}


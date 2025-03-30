import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Get the intended return URL, defaulting to the homepage
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get('callbackUrl') || '/';
  
  // Create the redirect response (use absolute URL to avoid hydration issues)
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const redirectUrl = new URL(callbackUrl, baseUrl).toString();
  const response = NextResponse.redirect(redirectUrl);
  
  // Log the logout attempt
  console.log("Logout initiated, redirecting to:", redirectUrl);
  
  // Clear all possible session cookies
  const cookieNames = [
    "next-auth.session-token",
    "next-auth.callback-url",
    "next-auth.csrf-token",
    "__Secure-next-auth.session-token",
    "__Secure-next-auth.callback-url",
    "__Secure-next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "next-auth.pkce.code_verifier"
  ];
  
  cookieNames.forEach(name => {
    console.log(`Removing cookie: ${name}`);
    response.cookies.delete(name);
  });

  // Also set the cookies to empty with expired date as a fallback
  cookieNames.forEach(name => {
    response.cookies.set({
      name,
      value: "",
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
  });
  
  return response;
}

export async function POST(request: Request) {
  return GET(request);
} 
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { v4 as uuidv4 } from "uuid"

export function middleware(request: NextRequest) {
  // Get the existing user ID from the cookie
  const userId = request.cookies.get("userId")?.value

  // If no user ID exists, create a new one
  if (!userId) {
    const response = NextResponse.next()

    // Generate a unique ID
    const newUserId = uuidv4()

    // Set the user ID cookie (30-day expiration)
    response.cookies.set({
      name: "userId",
      value: newUserId,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}


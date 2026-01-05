import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Reserved routes that should not be treated as tenant slugs
const RESERVED_ROUTES = [
  'admin',
  'auth',
  'api',
  'branch',
  'center-admin',
  'customer',
  'debug-login',
  'help',
  'pricing',
  'role-switcher',
  'services',
  'test-auth',
  'track',
  '_next',
  'favicon.ico',
  'images',
  'public',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register']
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route)
  
  // Get the first segment of the path
  const firstSegment = pathname.split('/')[1]
  
  // Check if it's a tenant route (not reserved)
  const isTenantRoute = firstSegment && 
    !RESERVED_ROUTES.includes(firstSegment) && 
    !firstSegment.startsWith('_')
  
  // If it's a public route or tenant route, allow access
  if (isPublicRoute || isTenantRoute) {
    return NextResponse.next()
  }
  
  // For protected routes, we'll handle authentication on the client side
  // since Zustand stores data in localStorage which is not accessible in middleware
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Current app version
const APP_VERSION = '2.0.0'

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
  'version',
  'releases',
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
  
  // Get the first and second segments of the path
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  const secondSegment = segments[1]
  
  // Check if first segment is a version number (e.g., /2.0.0, /1.0.0)
  const versionRegex = /^\d+\.\d+\.\d+$/
  if (firstSegment && versionRegex.test(firstSegment)) {
    // If version matches current version
    if (firstSegment === APP_VERSION) {
      // If there's a second segment (tenant), redirect to tenant with version param
      if (secondSegment) {
        const url = request.nextUrl.clone()
        url.pathname = `/${secondSegment}${segments.slice(2).length > 0 ? '/' + segments.slice(2).join('/') : ''}`
        url.searchParams.set('v', firstSegment)
        return NextResponse.redirect(url)
      }
      // Otherwise redirect to home with version param
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('v', firstSegment)
      return NextResponse.redirect(url)
    }
    // If it's a different version, redirect to version mismatch page
    const url = request.nextUrl.clone()
    url.pathname = '/version'
    url.searchParams.set('requested', firstSegment)
    return NextResponse.redirect(url)
  }
  
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

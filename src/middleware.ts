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
  'version',
  'releases',
  '_next',
  'favicon.ico',
  'images',
  'public',
  'www',
  'superadmin',
  'marketing'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Extract subdomain from hostname
  const subdomain = extractSubdomain(hostname)
  
  console.log('🌐 Middleware - Hostname:', hostname, 'Subdomain:', subdomain, 'Path:', pathname)
  
  // If we have a valid subdomain (not reserved), handle tenant routing
  if (subdomain && !RESERVED_ROUTES.includes(subdomain)) {
    console.log('🏢 Tenant subdomain detected:', subdomain)
    
    // Add subdomain to headers for the app to use
    const response = NextResponse.next()
    response.headers.set('x-tenant-subdomain', subdomain)
    
    // Store subdomain in cookie for client-side access
    response.cookies.set('tenant-subdomain', subdomain, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return response
  }
  
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

/**
 * Extract subdomain from hostname
 * Examples:
 * - prakash.laundrylobby.com → prakash
 * - www.laundrylobby.com → null (reserved)
 * - laundrylobby.com → null (main domain)
 * - localhost:3002 → null (development)
 */
function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0]
  
  // Skip localhost and IP addresses
  if (cleanHostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(cleanHostname)) {
    return null
  }
  
  // Skip Vercel preview URLs
  if (cleanHostname.endsWith('.vercel.app')) {
    return null
  }
  
  // Split hostname into parts
  const parts = cleanHostname.split('.')
  
  // Need at least 3 parts for subdomain (subdomain.domain.com)
  if (parts.length < 3) {
    return null
  }
  
  // Check if it's our main domain
  const domain = parts.slice(-2).join('.') // Get last 2 parts (domain.com)
  if (domain !== 'laundrylobby.com') {
    return null
  }
  
  // Get subdomain (first part)
  const subdomain = parts[0]
  
  // Skip reserved subdomains
  if (RESERVED_ROUTES.includes(subdomain)) {
    return null
  }
  
  return subdomain
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

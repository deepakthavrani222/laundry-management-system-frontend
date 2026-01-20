import { NextResponse } from 'next/server';

export function middleware(request) {
  const host = request.headers.get('host');
  const url = request.nextUrl.clone();
  
  if (!host) return NextResponse.next();
  
  // Extract subdomain
  const parts = host.split('.');
  const subdomain = parts[0];
  
  console.log('🌐 Middleware - Host:', host);
  console.log('🌐 Middleware - Subdomain:', subdomain);
  console.log('🌐 Middleware - Parts:', parts);
  
  // Skip for main domain, www, localhost, and Vercel domains
  const skipSubdomains = [
    'laundrylobby', 
    'laundrypro', 
    'www', 
    'localhost', 
    '127',
    // Skip Vercel preview domains
    'vercel'
  ];
  
  // Skip if it's a main domain or localhost
  if (skipSubdomains.some(skip => subdomain.includes(skip)) || parts.length <= 2) {
    console.log('🌐 Middleware - Skipping subdomain processing');
    return NextResponse.next();
  }
  
  // For tenant subdomains (e.g., tenant1.laundrylobby.com)
  if (parts.length > 2 && subdomain && !subdomain.includes('vercel')) {
    console.log('🏢 Middleware - Processing tenant:', subdomain);
    
    // Add tenant to URL params for the application to use
    url.searchParams.set('tenant', subdomain);
    
    // Add custom headers for tenant context
    const response = NextResponse.rewrite(url);
    response.headers.set('X-Tenant', subdomain);
    response.headers.set('X-Original-Host', host);
    
    console.log('🏢 Middleware - Rewriting with tenant context');
    return response;
  }
  
  console.log('🌐 Middleware - No processing needed');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
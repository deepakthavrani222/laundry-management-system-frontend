import { NextResponse } from 'next/server';

export async function middleware(request) {
  const host = request.headers.get('host');
  const subdomain = extractSubdomain(host);
  
  console.log('🔍 Middleware - Host:', host, 'Subdomain:', subdomain);
  
  // Handle tenant subdomains
  if (subdomain && !isSystemSubdomain(subdomain)) {
    console.log('🏢 Processing tenant subdomain:', subdomain);
    
    // Verify tenant exists
    const tenant = await verifyTenant(subdomain);
    
    if (tenant) {
      console.log('✅ Tenant found:', tenant.name);
      
      // Create response with tenant context
      const response = NextResponse.next();
      
      // Add tenant information to headers for the app to use
      response.headers.set('x-tenant-id', tenant.id);
      response.headers.set('x-tenant-subdomain', subdomain);
      response.headers.set('x-tenant-name', tenant.name);
      response.headers.set('x-tenant-data', JSON.stringify(tenant));
      
      return response;
    } else {
      console.log('❌ Tenant not found for subdomain:', subdomain);
      
      // Tenant not found - show custom 404 page
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laundry Not Found - LaundryPro</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; padding: 40px; text-align: center; background: #f8fafc;
            }
            .container { max-width: 500px; margin: 0 auto; }
            .logo { font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 20px; }
            h1 { color: #1e293b; margin-bottom: 10px; }
            p { color: #64748b; line-height: 1.6; }
            .btn { 
              display: inline-block; padding: 12px 24px; background: #3b82f6; 
              color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;
            }
            .btn:hover { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🧺 LaundryPro</div>
            <h1>Laundry Service Not Found</h1>
            <p>The laundry service at <strong>${subdomain}.laundrypro.com</strong> could not be found.</p>
            <p>This could mean:</p>
            <ul style="text-align: left; color: #64748b;">
              <li>The laundry service is temporarily unavailable</li>
              <li>The URL was typed incorrectly</li>
              <li>The service has been moved or discontinued</li>
            </ul>
            <a href="https://laundrypro.com" class="btn">← Back to LaundryPro</a>
          </div>
        </body>
        </html>
        `,
        { 
          status: 404,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    }
  }
  
  // For system subdomains or main domain, continue normally
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
     * - _vercel (Vercel internals)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|_vercel).*)',
  ],
};

/**
 * Extract subdomain from host
 * @param {string} host - The host header
 * @returns {string|null} - The subdomain or null
 */
function extractSubdomain(host) {
  if (!host) return null;
  
  // Skip localhost and IP addresses
  if (host.includes('localhost') || host.match(/^\d+\.\d+\.\d+\.\d+/)) {
    return null;
  }
  
  // Extract subdomain from host
  const parts = host.split('.');
  
  // For laundrypro.com, we need at least 3 parts for a subdomain
  if (parts.length >= 3) {
    const subdomain = parts[0];
    
    // Skip www
    if (subdomain === 'www') {
      return null;
    }
    
    return subdomain;
  }
  
  return null;
}

/**
 * Check if subdomain is a system subdomain (not a tenant)
 * @param {string} subdomain - The subdomain to check
 * @returns {boolean} - Whether it's a system subdomain
 */
function isSystemSubdomain(subdomain) {
  const systemSubdomains = [
    'app',      // Main customer portal
    'admin',    // Superadmin portal  
    'sales',    // Sales portal
    'api',      // API endpoints
    'cdn',      // CDN
    'assets',   // Static assets
    'mail',     // Email services
    'ftp',      // FTP
    'blog',     // Blog
    'help',     // Help/Support
    'status',   // Status page
    'test',     // Testing
    'staging',  // Staging environment
    'dev'       // Development
  ];
  
  return systemSubdomains.includes(subdomain.toLowerCase());
}

/**
 * Verify tenant exists and is active
 * @param {string} subdomain - The subdomain to verify
 * @returns {Promise<Object|null>} - Tenant data or null
 */
async function verifyTenant(subdomain) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    console.log('🔍 Verifying tenant:', subdomain, 'API URL:', apiUrl);
    
    const response = await fetch(`${apiUrl}/tenants/verify/${subdomain}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LaundryPro-Frontend/1.0',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Tenant verification successful:', data);
      return data.data;
    } else {
      console.log('❌ Tenant verification failed:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('❌ Tenant verification error:', error.message);
    return null;
  }
}
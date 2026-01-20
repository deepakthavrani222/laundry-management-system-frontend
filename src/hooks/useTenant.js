'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function useTenant() {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState(null);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const detectTenant = async () => {
      try {
        // Get tenant from URL params (set by middleware)
        const urlTenant = searchParams.get('tenant');
        
        // Get tenant from hostname (client-side backup)
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        const subdomain = parts[0];
        
        console.log('🏢 useTenant - URL Tenant:', urlTenant);
        console.log('🏢 useTenant - Hostname:', hostname);
        console.log('🏢 useTenant - Subdomain:', subdomain);
        
        // Determine tenant
        let detectedTenant = null;
        
        if (urlTenant) {
          detectedTenant = urlTenant;
        } else if (parts.length > 2 && subdomain !== 'www' && subdomain !== 'localhost' && !subdomain.includes('vercel')) {
          detectedTenant = subdomain;
        }
        
        console.log('🏢 useTenant - Detected Tenant:', detectedTenant);
        
        setTenant(detectedTenant);
        
        // Store in sessionStorage for consistency across navigation
        if (detectedTenant) {
          sessionStorage.setItem('currentTenant', detectedTenant);
          
          // Fetch tenant-specific data
          try {
            const response = await fetch(`/api/public/tenancy/branding/${detectedTenant}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                setTenantData(data.data);
                console.log('🏢 useTenant - Tenant Data:', data.data);
              }
            }
          } catch (error) {
            console.error('🏢 useTenant - Error fetching tenant data:', error);
          }
        } else {
          sessionStorage.removeItem('currentTenant');
        }
        
      } catch (error) {
        console.error('🏢 useTenant - Error detecting tenant:', error);
      } finally {
        setLoading(false);
      }
    };
    
    detectTenant();
  }, [searchParams]);
  
  // Helper functions
  const isTenantPage = Boolean(tenant);
  const getTenantUrl = (path = '') => {
    if (!tenant) return path;
    return `https://${tenant}.${window.location.hostname.split('.').slice(1).join('.')}${path}`;
  };
  
  const getMainUrl = (path = '') => {
    const mainDomain = window.location.hostname.split('.').slice(1).join('.');
    return `https://${mainDomain}${path}`;
  };
  
  return { 
    tenant, 
    loading, 
    tenantData,
    isTenantPage,
    getTenantUrl,
    getMainUrl,
    // Legacy support
    tenantSlug: tenant,
    tenantInfo: tenantData
  };
}

// Export default for easier imports
export default useTenant;
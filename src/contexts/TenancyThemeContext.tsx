'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

export interface TenancyTheme {
  name: string;
  subdomain: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCss?: string;
}

interface TenancyThemeContextType {
  theme: TenancyTheme | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultTheme: TenancyTheme = {
  name: 'LaundryPro',
  subdomain: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  accentColor: '#60A5FA',
  fontFamily: 'Inter',
};

const TenancyThemeContext = createContext<TenancyThemeContextType>({
  theme: defaultTheme,
  loading: false,
  error: null,
  refetch: async () => {},
});

export const useTenancyTheme = () => useContext(TenancyThemeContext);

interface TenancyThemeProviderProps {
  children: ReactNode;
  subdomain?: string;
}

export function TenancyThemeProvider({ children, subdomain }: TenancyThemeProviderProps) {
  const [theme, setTheme] = useState<TenancyTheme | null>(defaultTheme);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTheme = async () => {
    // Get subdomain from URL if not provided
    let tenancySubdomain = subdomain;
    
    if (!tenancySubdomain && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Extract subdomain (e.g., "cleanfresh" from "cleanfresh.laundry-platform.com")
      const parts = hostname.split('.');
      // Only extract subdomain if we have more than 2 parts (e.g., sub.domain.com)
      // and it's not a known deployment domain
      const knownDomains = ['localhost', 'vercel', 'app', 'onrender', 'netlify', 'pages', 'dev'];
      if (parts.length > 2 && !knownDomains.some(d => hostname.includes(d))) {
        tenancySubdomain = parts[0];
      }
    }

    // Skip fetching for localhost, deployment platforms, or no subdomain
    if (!tenancySubdomain || 
        tenancySubdomain === 'localhost' || 
        tenancySubdomain === 'www' ||
        tenancySubdomain.includes('laundry-management')) {
      setTheme(defaultTheme);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/tenancy/branding/${tenancySubdomain}`);
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setTheme({
          name: data.name || defaultTheme.name,
          subdomain: data.subdomain || tenancySubdomain,
          logo: data.branding?.logo?.url || undefined,
          primaryColor: data.branding?.theme?.primaryColor || defaultTheme.primaryColor,
          secondaryColor: data.branding?.theme?.secondaryColor || defaultTheme.secondaryColor,
          accentColor: data.branding?.theme?.accentColor || defaultTheme.accentColor,
          fontFamily: data.branding?.theme?.fontFamily || defaultTheme.fontFamily,
          customCss: data.branding?.customCss || undefined,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch tenancy theme:', err);
      setError(err.response?.data?.message || 'Failed to load theme');
      setTheme(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, [subdomain]);

  // Apply CSS variables when theme changes
  useEffect(() => {
    if (theme && typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--tenancy-primary', theme.primaryColor);
      root.style.setProperty('--tenancy-secondary', theme.secondaryColor);
      root.style.setProperty('--tenancy-accent', theme.accentColor);
      root.style.setProperty('--tenancy-font', theme.fontFamily);

      // Apply custom CSS if provided
      if (theme.customCss) {
        let styleEl = document.getElementById('tenancy-custom-css');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'tenancy-custom-css';
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = theme.customCss;
      }
    }
  }, [theme]);

  return (
    <TenancyThemeContext.Provider value={{ theme, loading, error, refetch: fetchTheme }}>
      {children}
    </TenancyThemeContext.Provider>
  );
}

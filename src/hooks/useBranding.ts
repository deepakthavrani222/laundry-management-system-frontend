import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export interface BrandingData {
  logo?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCss?: string;
}

export interface TenancyBranding {
  branding: {
    logo?: { url?: string; publicId?: string };
    favicon?: { url?: string; publicId?: string };
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      fontFamily?: string;
      layout?: string;
    };
    customCss?: string;
  };
  name: string;
  subdomain: string;
  customDomain?: string;
}

export function useBranding() {
  const [branding, setBranding] = useState<TenancyBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranding = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/tenancy/branding');
      setBranding(response.data.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch branding';
      setError(message);
      console.error('Error fetching branding:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBranding = async (data: Partial<BrandingData>): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      // Transform frontend format to backend format
      const payload = {
        branding: {
          theme: {
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
            accentColor: data.accentColor,
            fontFamily: data.fontFamily,
          },
          customCss: data.customCss,
        }
      };
      const response = await api.put('/admin/tenancy/branding', payload);
      await fetchBranding(); // Refresh to get updated data
      toast.success('Branding updated successfully');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update branding';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      setSaving(true);
      setError(null);
      
      // Convert file to base64 for simple upload
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const base64 = await base64Promise;
      
      await api.patch('/admin/tenancy/branding/logo', {
        url: base64,
        publicId: `logo_${Date.now()}`
      });
      
      // Refresh branding data after logo upload
      await fetchBranding();
      toast.success('Logo uploaded successfully');
      return base64;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to upload logo';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const removeLogo = async (): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      await api.patch('/admin/tenancy/branding/logo', { url: '', publicId: '' });
      await fetchBranding();
      toast.success('Logo removed successfully');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to remove logo';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  return {
    branding,
    loading,
    saving,
    error,
    updateBranding,
    uploadLogo,
    removeLogo,
    refetch: fetchBranding,
  };
}

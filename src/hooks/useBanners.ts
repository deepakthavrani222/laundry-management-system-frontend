import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Banner {
  _id: string;
  title: string;
  description?: string;
  type: 'PROMOTIONAL' | 'INFORMATIONAL' | 'SEASONAL' | 'ANNOUNCEMENT';
  imageUrl: string;
  targetPages: string[];
  actionType: 'LINK' | 'PROMOTION' | 'NONE';
  actionUrl?: string;
  linkedPromotion?: {
    promotionType: 'Campaign' | 'Coupon' | 'Discount' | 'Referral' | 'LoyaltyProgram';
    promotionId: string;
  };
  priority: number;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  bannerScope: 'TENANT' | 'GLOBAL';
  analytics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
  };
}

// Get all tenant banners
export const useTenantBanners = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBanners = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    targetPage?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/admin/banners`, {
        params,
        withCredentials: true
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch banners');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getBanners, loading, error };
};

// Get single banner
export const useBanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBanner = async (bannerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/admin/banners/${bannerId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getBanner, loading, error };
};

// Create banner
export const useCreateBanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBanner = async (bannerData: Partial<Banner>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/admin/banners`, bannerData, {
        withCredentials: true
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createBanner, loading, error };
};

// Update banner
export const useUpdateBanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBanner = async (bannerId: string, bannerData: Partial<Banner>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/admin/banners/${bannerId}`, bannerData, {
        withCredentials: true
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateBanner, loading, error };
};

// Delete banner
export const useDeleteBanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBanner = async (bannerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`${API_URL}/admin/banners/${bannerId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteBanner, loading, error };
};

// Toggle banner status
export const useToggleBannerStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (bannerId: string, currentState: string) => {
    setLoading(true);
    setError(null);
    try {
      // Determine new state based on current state
      let newState = '';
      if (currentState === 'ACTIVE') {
        newState = 'PAUSED';
      } else if (currentState === 'PAUSED') {
        newState = 'ACTIVE';
      } else if (currentState === 'DRAFT') {
        // Submit for approval instead
        const response = await axios.post(`${API_URL}/admin/banners/${bannerId}/submit-approval`, {}, {
          withCredentials: true
        });
        return response.data;
      } else {
        throw new Error(`Cannot toggle status from ${currentState} state`);
      }

      const response = await axios.patch(`${API_URL}/admin/banners/${bannerId}/state`, 
        { newState },
        { withCredentials: true }
      );
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle banner status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
};

// Get banner analytics
export const useBannerAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAnalytics = async (bannerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/admin/banners/${bannerId}/analytics`, {
        withCredentials: true
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getAnalytics, loading, error };
};

// Upload banner image
export const useUploadBannerImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${API_URL}/admin/banners/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percentCompleted);
        }
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading, error, progress };
};

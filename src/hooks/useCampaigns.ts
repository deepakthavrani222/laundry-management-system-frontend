import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useActiveCampaigns(page?: string) {
  const { token } = useAuthStore();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const url = page 
        ? `${API_URL}/customer/campaigns/active?page=${page}`
        : `${API_URL}/customer/campaigns/active`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.data.campaigns);
      } else {
        setError(data.message || 'Failed to fetch campaigns');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [token, page]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
}

export function useCampaignDetails(campaignId: string) {
  const { token } = useAuthStore();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    if (!token || !campaignId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setCampaign(data.data.campaign);
      } else {
        setError(data.message || 'Failed to fetch campaign');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaign');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [token, campaignId]);

  return { campaign, loading, error, refetch: fetchCampaign };
}

export function useClaimCampaign() {
  const { token } = useAuthStore();
  const [claiming, setClaiming] = useState(false);

  const claimCampaign = async (campaignId: string) => {
    if (!token) {
      toast.error('Please login to claim offer');
      return { success: false };
    }

    try {
      setClaiming(true);
      const response = await fetch(`${API_URL}/customer/campaigns/${campaignId}/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Campaign offer claimed successfully!');
        return { success: true, data: data.data };
      } else {
        toast.error(data.message || 'Failed to claim offer');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to claim offer');
      return { success: false, message: err.message };
    } finally {
      setClaiming(false);
    }
  };

  return { claimCampaign, claiming };
}

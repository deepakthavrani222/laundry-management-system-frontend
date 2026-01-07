import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ReferralData {
  hasProgram: boolean;
  referralCode?: string;
  referralLink?: string;
  program?: {
    _id: string;
    name: string;
    description: string;
    referrerReward: any;
    refereeReward: any;
    minOrderValue: number;
  };
  stats?: {
    totalReferrals: number;
    completedReferrals: number;
    totalClicks: number;
    totalSignups: number;
    totalConversions: number;
    totalRewards: number;
  };
  expiresAt?: string;
}

export function useReferralCode() {
  const { token } = useAuthStore();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferralCode = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/referrals/code`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setReferralData(data.data);
      } else {
        setError(data.message || 'Failed to fetch referral code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch referral code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralCode();
  }, [token]);

  return { referralData, loading, error, refetch: fetchReferralCode };
}

export function useReferralStats() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/referrals/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
        setRecentReferrals(data.data.recentReferrals);
      } else {
        setError(data.message || 'Failed to fetch referral stats');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch referral stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  return { stats, recentReferrals, loading, error, refetch: fetchStats };
}

export function useTrackReferralShare() {
  const { token } = useAuthStore();
  const [tracking, setTracking] = useState(false);

  const trackShare = async (platform: string) => {
    if (!token) return;

    try {
      setTracking(true);
      await fetch(`${API_URL}/customer/referrals/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ platform }),
      });
    } catch (err) {
      console.error('Failed to track share:', err);
    } finally {
      setTracking(false);
    }
  };

  return { trackShare, tracking };
}

export function useApplyReferralCode() {
  const [applying, setApplying] = useState(false);

  const applyCode = async (code: string, tenancyId?: string) => {
    try {
      setApplying(true);
      const response = await fetch(`${API_URL}/customer/referrals/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, tenancyId }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.data.message || 'Referral code applied!');
        return { success: true, data: data.data };
      } else {
        toast.error(data.message || 'Invalid referral code');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply referral code');
      return { success: false, message: err.message };
    } finally {
      setApplying(false);
    }
  };

  return { applyCode, applying };
}

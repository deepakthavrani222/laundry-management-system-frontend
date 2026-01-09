import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface LoyaltyBalance {
  enrolled: boolean;
  pointsBalance?: number;
  lifetimePoints?: number;
  redeemedPoints?: number;
  currentTier?: {
    name: string;
    minPoints: number;
    discountPercentage?: number;
  };
  totalSpent?: number;
  totalOrders?: number;
  program?: {
    _id: string;
    name: string;
    type: string;
    pointsConfig?: any;
    tiers?: any[];
  };
  canEnroll?: boolean;
}

interface LoyaltyTransaction {
  _id: string;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string;
  createdAt: string;
  order?: {
    orderNumber: string;
    totalAmount: number;
  };
}

export function useLoyaltyBalance() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getBalance = async () => {
    if (!token) {
      setLoading(false);
      return { success: false, data: null };
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/loyalty/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        setError(data.message || 'Failed to fetch loyalty balance');
        return { success: false, data: null };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch loyalty balance');
      return { success: false, data: null };
    } finally {
      setLoading(false);
    }
  };

  return { getBalance, loading, error };
}

export function useLoyaltyTransactions(page: number = 1, limit: number = 20) {
  const { token } = useAuthStore();
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_URL}/customer/loyalty/transactions?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data.transactions);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || 'Failed to fetch transactions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token, page, limit]);

  return { transactions, pagination, loading, error, refetch: fetchTransactions };
}

export function useEnrollLoyalty() {
  const { token } = useAuthStore();
  const [enrolling, setEnrolling] = useState(false);

  const enroll = async () => {
    if (!token) {
      toast.error('Please login to enroll');
      return { success: false };
    }

    try {
      setEnrolling(true);
      const response = await fetch(`${API_URL}/customer/loyalty/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Successfully enrolled in loyalty program!');
        return { success: true, data: data.data };
      } else {
        toast.error(data.message || 'Failed to enroll');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to enroll');
      return { success: false, message: err.message };
    } finally {
      setEnrolling(false);
    }
  };

  return { enroll, enrolling };
}

export function useRedeemPoints() {
  const { token } = useAuthStore();
  const [redeeming, setRedeeming] = useState(false);

  const redeem = async (points: number, redemptionType: string, value: number) => {
    if (!token) {
      toast.error('Please login to redeem points');
      return { success: false };
    }

    try {
      setRedeeming(true);
      const response = await fetch(`${API_URL}/customer/loyalty/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points, redemptionType, value }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Points redeemed successfully!');
        return { success: true, data: data.data };
      } else {
        toast.error(data.message || 'Failed to redeem points');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to redeem points');
      return { success: false, message: err.message };
    } finally {
      setRedeeming(false);
    }
  };

  return { redeem, redeeming };
}

export function useAvailableRewards() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRewards = async () => {
    if (!token) {
      setLoading(false);
      return { success: false, data: [] };
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/loyalty/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data.rewards || [] };
      } else {
        setError(data.message || 'Failed to fetch rewards');
        return { success: false, data: [] };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rewards');
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  };

  return { getRewards, loading, error };
}

export function useTierInfo() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTierInfo = async () => {
    if (!token) {
      setLoading(false);
      return { success: false, data: null };
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/loyalty/tier`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        setError(data.message || 'Failed to fetch tier info');
        return { success: false, data: null };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tier info');
      return { success: false, data: null };
    } finally {
      setLoading(false);
    }
  };

  return { getTierInfo, loading, error };
}

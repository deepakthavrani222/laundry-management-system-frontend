import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useApplicableDiscounts() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDiscounts = async (orderValue: number, serviceType?: string, items?: any[]) => {
    if (!token) {
      return { success: false, discounts: [], totalDiscount: 0 };
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/discounts/applicable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderValue, serviceType, items }),
      });
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          discounts: data.data.applicableDiscounts,
          totalDiscount: data.data.totalDiscount,
          finalAmount: data.data.finalAmount,
        };
      } else {
        setError(data.message || 'Failed to fetch discounts');
        return { success: false, discounts: [], totalDiscount: 0 };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch discounts');
      return { success: false, discounts: [], totalDiscount: 0 };
    } finally {
      setLoading(false);
    }
  };

  return { getDiscounts, loading, error };
}

export function useActiveDiscounts() {
  const { token } = useAuthStore();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscounts = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/discounts/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setDiscounts(data.data.discounts);
      } else {
        setError(data.message || 'Failed to fetch discounts');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  return { discounts, loading, error, fetchDiscounts };
}

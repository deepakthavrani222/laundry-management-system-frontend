import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useActiveCoupons = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActiveCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/customer/coupons/active`, {
        withCredentials: true
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch coupons');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getActiveCoupons, loading, error };
};

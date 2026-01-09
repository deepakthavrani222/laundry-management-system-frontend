import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useActiveDiscounts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActiveDiscounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/customer/discounts/active`, {
        withCredentials: true
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch discounts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getActiveDiscounts, loading, error };
};

export const useApplicableDiscounts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDiscounts = async (orderData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/customer/discounts/applicable`, orderData, {
        withCredentials: true
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applicable discounts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getDiscounts, loading, error };
};

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useWalletBalance() {
  const { token } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setBalance(data.data.balance);
      } else {
        setError(data.message || 'Failed to fetch wallet balance');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallet balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [token]);

  return { balance, loading, error, refetch: fetchBalance };
}

export function useWalletTransactions(page: number = 1, limit: number = 20) {
  const { token } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
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
        `${API_URL}/customer/wallet/transactions?page=${page}&limit=${limit}`,
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

export function useAddMoneyToWallet() {
  const { token } = useAuthStore();
  const [adding, setAdding] = useState(false);

  const addMoney = async (amount: number, paymentMethod: string, transactionId: string) => {
    if (!token) {
      toast.error('Please login to add money');
      return { success: false };
    }

    try {
      setAdding(true);
      const response = await fetch(`${API_URL}/customer/wallet/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, paymentMethod, transactionId }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Money added to wallet successfully!');
        return { success: true, data: data.data };
      } else {
        toast.error(data.message || 'Failed to add money');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add money');
      return { success: false, message: err.message };
    } finally {
      setAdding(false);
    }
  };

  return { addMoney, adding };
}

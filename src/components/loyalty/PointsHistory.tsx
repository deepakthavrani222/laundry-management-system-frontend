'use client';

import { useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Calendar } from 'lucide-react';
import { useLoyaltyTransactions } from '@/hooks/useLoyalty';

export default function PointsHistory() {
  const { transactions, pagination, loading, refetch } = useLoyaltyTransactions(1, 20);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No transaction history yet</p>
        <p className="text-gray-400 text-sm mt-2">Start earning points by placing orders!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Points History</h3>
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === 'earned'
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}>
                {transaction.type === 'earned' ? (
                  <ArrowUpCircle size={20} className="text-green-600" />
                ) : (
                  <ArrowDownCircle size={20} className="text-red-600" />
                )}
              </div>
              
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-lg font-bold ${
                transaction.type === 'earned'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {transaction.type === 'earned' ? '+' : '-'}{transaction.points}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

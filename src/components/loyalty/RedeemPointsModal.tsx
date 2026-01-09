'use client';

import { useState } from 'react';
import { X, Gift, Star, AlertCircle } from 'lucide-react';
import { useRedeemPoints } from '@/hooks/useLoyalty';

interface RedeemPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: any;
  currentPoints: number;
  onSuccess: () => void;
}

export default function RedeemPointsModal({ isOpen, onClose, reward, currentPoints, onSuccess }: RedeemPointsModalProps) {
  const { redeem, redeeming } = useRedeemPoints();
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async () => {
    setError(null);
    try {
      const pointsRequired = reward.pointsRequired || reward.pointsCost || 0;
      const result = await redeem(pointsRequired, reward.type, reward.value);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || 'Failed to redeem reward');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to redeem reward');
    }
  };

  if (!isOpen) return null;

  const pointsRequired = reward.pointsRequired || reward.pointsCost || 0;
  const remainingPoints = currentPoints - pointsRequired;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Redeem Reward</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{reward.name}</h3>
              <p className="text-sm text-gray-600">{reward.description}</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Points Required</span>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-purple-600" fill="currentColor" />
                <span className="font-bold text-purple-900">{pointsRequired}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Your Current Points</span>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-purple-600" fill="currentColor" />
                <span className="font-bold text-purple-900">{currentPoints}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-purple-200">
              <span className="text-sm font-medium text-gray-900">Remaining Points</span>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-purple-600" fill="currentColor" />
                <span className="font-bold text-purple-900">{remainingPoints}</span>
              </div>
            </div>
          </div>

          {reward.termsAndConditions && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-600 font-medium mb-2">Terms & Conditions:</p>
              <p className="text-xs text-gray-600">{reward.termsAndConditions}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleRedeem}
              disabled={redeeming}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition disabled:opacity-50"
            >
              {redeeming ? 'Redeeming...' : 'Confirm Redeem'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

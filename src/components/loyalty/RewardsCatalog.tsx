'use client';

import { useState } from 'react';
import { Gift, Star, Check } from 'lucide-react';
import { useRedeemPoints } from '@/hooks/useLoyalty';
import RedeemPointsModal from './RedeemPointsModal';

interface RewardsCatalogProps {
  rewards: any[];
  currentPoints: number;
  onRedeem: () => void;
}

export default function RewardsCatalog({ rewards, currentPoints, onRedeem }: RewardsCatalogProps) {
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const handleRedeemClick = (reward: any) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const handleRedeemSuccess = () => {
    setShowRedeemModal(false);
    setSelectedReward(null);
    onRedeem();
  };

  if (rewards.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No rewards available</p>
        <p className="text-gray-400 text-sm mt-2">Check back later for exciting rewards!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Available Rewards</h3>
        <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
          <Star size={20} className="text-purple-600" fill="currentColor" />
          <span className="font-semibold text-purple-900">{currentPoints.toLocaleString()} points</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const pointsRequired = reward.pointsRequired || reward.pointsCost || 0;
          const canAfford = currentPoints >= pointsRequired;
          const isAvailable = reward.canRedeem !== false && (!reward.expiryDate || new Date(reward.expiryDate) > new Date());

          return (
            <div
              key={reward.id || reward._id}
              className={`bg-white border-2 rounded-xl p-6 transition ${
                canAfford && isAvailable
                  ? 'border-purple-200 hover:border-purple-400 hover:shadow-lg'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <Gift size={24} className="text-white" />
                </div>
                {canAfford && isAvailable && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    Available
                  </span>
                )}
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">{reward.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-purple-600" fill="currentColor" />
                  <span className="font-bold text-purple-900">{pointsRequired}</span>
                  <span className="text-sm text-gray-600">points</span>
                </div>

                <button
                  onClick={() => handleRedeemClick(reward)}
                  disabled={!canAfford || !isAvailable}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    canAfford && isAvailable
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Redeem
                </button>
              </div>

              {reward.termsAndConditions && (
                <p className="text-xs text-gray-500 mt-3">
                  {reward.termsAndConditions}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {selectedReward && (
        <RedeemPointsModal
          isOpen={showRedeemModal}
          onClose={() => {
            setShowRedeemModal(false);
            setSelectedReward(null);
          }}
          reward={selectedReward}
          currentPoints={currentPoints}
          onSuccess={handleRedeemSuccess}
        />
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Star, Gift, TrendingUp, Award, History } from 'lucide-react';
import { useLoyaltyBalance, useTierInfo, useAvailableRewards, useEnrollLoyalty } from '@/hooks/useLoyalty';
import PointsHistory from './PointsHistory';
import TierProgress from './TierProgress';
import RewardsCatalog from './RewardsCatalog';

export default function LoyaltyDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history'>('overview');
  const { getBalance, loading: balanceLoading } = useLoyaltyBalance();
  const { getTierInfo, loading: tierLoading } = useTierInfo();
  const { getRewards, loading: rewardsLoading } = useAvailableRewards();
  const { enroll, enrolling } = useEnrollLoyalty();
  
  const [balance, setBalance] = useState<any>(null);
  const [tierInfo, setTierInfo] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceResult, tierResult, rewardsResult] = await Promise.all([
        getBalance(),
        getTierInfo(),
        getRewards()
      ]);
      setBalance(balanceResult.data);
      setTierInfo(tierResult.data);
      setRewards(rewardsResult.data || []);
    } catch (error) {
      console.error('Failed to load loyalty data:', error);
    }
  };

  const handleEnroll = async () => {
    const result = await enroll();
    if (result.success) {
      await loadData();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Star },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loyalty Program</h1>
        <p className="text-gray-600">Earn points with every order and unlock exclusive rewards</p>
      </div>

      {/* Not Enrolled Message */}
      {balance && !balance.enrolled && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white mb-8 shadow-xl">
          <div className="text-center">
            <Star size={48} className="mx-auto mb-4" fill="white" />
            <h2 className="text-2xl font-bold mb-2">Join Our Loyalty Program!</h2>
            <p className="text-lg mb-6 opacity-90">
              {balance.canEnroll 
                ? 'Start earning points with every order and unlock exclusive rewards'
                : 'No active loyalty program available at the moment'}
            </p>
            {balance.canEnroll && (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now - It\'s Free!'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Enrolled - Show Points Summary */}
      {balance && balance.enrolled && (
        <>
          {/* Points Summary Card */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={24} fill="white" />
                  <p className="text-lg font-medium opacity-90">Available Points</p>
                </div>
                <p className="text-5xl font-bold">{balance?.pointsBalance?.toLocaleString() || 0}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award size={24} />
                  <p className="text-lg font-medium opacity-90">Current Tier</p>
                </div>
                <p className="text-3xl font-bold">{balance?.currentTier?.name || 'Bronze'}</p>
                <p className="text-sm opacity-80 mt-1">{tierInfo?.currentTier?.benefits?.length || 0} Benefits</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={24} />
                  <p className="text-lg font-medium opacity-90">Lifetime Points</p>
                </div>
                <p className="text-3xl font-bold">{balance?.lifetimePoints?.toLocaleString() || 0}</p>
                <p className="text-sm opacity-80 mt-1">Total earned</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <div className="flex gap-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                        activeTab === tab.id
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <TierProgress tierInfo={tierInfo} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Earn Points</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">1</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Place Orders</p>
                            <p className="text-sm text-gray-600">Earn 1 point per ₹10 spent</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">2</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Refer Friends</p>
                            <p className="text-sm text-gray-600">Get 100 bonus points per referral</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">3</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Complete Profile</p>
                            <p className="text-sm text-gray-600">Earn 50 points for verification</p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Benefits</h3>
                      <div className="space-y-3">
                        {tierInfo?.currentTier?.benefits && tierInfo.currentTier.benefits.length > 0 ? (
                          tierInfo.currentTier.benefits.map((benefit: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <Star size={16} className="text-purple-600" fill="currentColor" />
                              <p className="text-sm text-gray-700">{benefit}</p>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <Star size={16} className="text-purple-600" fill="currentColor" />
                              <p className="text-sm text-gray-700">Earn points on every order</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star size={16} className="text-purple-600" fill="currentColor" />
                              <p className="text-sm text-gray-700">Redeem points for discounts</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star size={16} className="text-purple-600" fill="currentColor" />
                              <p className="text-sm text-gray-700">Exclusive member offers</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star size={16} className="text-purple-600" fill="currentColor" />
                              <p className="text-sm text-gray-700">Priority customer support</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rewards' && (
                <RewardsCatalog rewards={rewards} currentPoints={balance?.pointsBalance || 0} onRedeem={loadData} />
              )}

              {activeTab === 'history' && (
                <PointsHistory />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

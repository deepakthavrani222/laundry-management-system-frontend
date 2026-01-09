'use client';

import { useEffect, useState } from 'react';
import { Users, Share2, Gift, TrendingUp } from 'lucide-react';
import { useReferralCode, useReferralStats } from '@/hooks/useReferral';
import ReferralStats from './ReferralStats';
import ShareButtons from './ShareButtons';

export default function ReferralDashboard() {
  const { referralData, loading: codeLoading, refetch: refetchCode } = useReferralCode();
  const { stats, recentReferrals, loading: statsLoading, refetch: refetchStats } = useReferralStats();

  const loading = codeLoading || statsLoading;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading referral data...</p>
        </div>
      </div>
    );
  }

  if (!referralData?.hasProgram) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">No active referral program available</p>
          <p className="text-yellow-600 text-sm mt-2">Check back later for referral opportunities!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Refer & Earn</h1>
        <p className="text-gray-600">Share your referral code and earn rewards</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-900">{stats?.totalReferrals || 0}</p>
          <p className="text-sm text-blue-700 mt-1">Total Referrals</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-900">{stats?.completedReferrals || 0}</p>
          <p className="text-sm text-green-700 mt-1">Successful</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Gift className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-purple-900">₹{stats?.totalRewards || 0}</p>
          <p className="text-sm text-purple-700 mt-1">Total Earnings</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Share2 className="text-orange-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-orange-900">{stats?.pendingReferrals || 0}</p>
          <p className="text-sm text-orange-700 mt-1">Pending</p>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Your Referral Code</h2>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-8 text-white mb-6">
          <p className="text-lg mb-4">Your Referral Code</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/20 backdrop-blur rounded-lg px-6 py-4">
              <p className="text-3xl font-bold tracking-wider">{referralData?.referralCode || 'Loading...'}</p>
            </div>
          </div>
          <p className="text-sm opacity-90 mt-4">
            Share this code with friends and earn {referralData?.program?.referrerReward?.type === 'credit' ? '₹' : ''}{referralData?.program?.referrerReward?.value}{referralData?.program?.referrerReward?.type === 'coupon' ? '% coupon' : ''} for each successful referral!
          </p>
        </div>

        <ShareButtons 
          code={referralData?.referralCode} 
          link={referralData?.referralLink}
        />
      </div>

      {/* Referral Stats */}
      <ReferralStats stats={stats} />

      {/* How it Works */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">1</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Share Your Code</h4>
            <p className="text-sm text-gray-600">Send your unique referral code to friends and family</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">2</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">They Sign Up</h4>
            <p className="text-sm text-gray-600">Your friend registers using your referral code</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">3</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Earn Rewards</h4>
            <p className="text-sm text-gray-600">Both you and your friend get rewards!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

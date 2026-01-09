'use client';

import { useState, useEffect } from 'react';
import { Gift, Tag, Percent, TrendingUp } from 'lucide-react';
import { useActiveCampaigns } from '@/hooks/useCampaigns';
import { useActiveCoupons } from '@/hooks/useCoupons';
import { useActiveDiscounts } from '@/hooks/useDiscounts';
import BannerCarousel from '@/components/customer/BannerCarousel';

export default function CustomerOffersPage() {
  const { getActiveCampaigns, loading: campaignsLoading } = useActiveCampaigns();
  const { getActiveCoupons, loading: couponsLoading } = useActiveCoupons();
  const { getActiveDiscounts, loading: discountsLoading } = useActiveDiscounts();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const [campaignsData, couponsData, discountsData] = await Promise.all([
        getActiveCampaigns(),
        getActiveCoupons(),
        getActiveDiscounts()
      ]);

      setCampaigns(campaignsData.data || []);
      setCoupons(couponsData.data || []);
      setDiscounts(discountsData.data || []);
    } catch (error) {
      console.error('Failed to load offers:', error);
    }
  };

  const loading = campaignsLoading || couponsLoading || discountsLoading;

  return (
    <div className="space-y-6">
      {/* Page Header - with extra top margin */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 mt-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Offers</h1>
        <p className="text-gray-600">Discover amazing deals and save on your orders</p>
      </div>

      {/* Banner Carousel */}
      <div>
        <BannerCarousel page="OFFERS" />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Campaigns Section */}
      {!loading && campaigns.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Active Campaigns</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                    <p className="text-sm text-gray-600">{campaign.description}</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Valid until</span>
                  <span className="font-medium text-gray-900">
                    {new Date(campaign.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coupons Section */}
      {!loading && coupons.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Available Coupons</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div key={coupon._id} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-lg font-mono font-bold text-sm mb-3">
                      {coupon.code}
                    </div>
                    <p className="text-sm text-gray-700">{coupon.description}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Tag className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {coupon.discountType === 'PERCENTAGE' 
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`
                    }
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Copy Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discounts Section */}
      {!loading && discounts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Automatic Discounts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discounts.map((discount) => (
              <div key={discount._id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{discount.name}</h3>
                    <p className="text-sm text-gray-700">{discount.description}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Percent className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-semibold inline-block">
                  {discount.discountType === 'PERCENTAGE' 
                    ? `${discount.discountValue}% OFF`
                    : `₹${discount.discountValue} OFF`
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && campaigns.length === 0 && coupons.length === 0 && discounts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No offers available</h3>
          <p className="text-gray-600">Check back later for exciting deals and discounts!</p>
        </div>
      )}
    </div>
  );
}

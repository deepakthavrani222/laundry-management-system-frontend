'use client';

import TenantCustomerLayout from '@/components/layout/TenantCustomerLayout';
import { useEffect, useState } from 'react';
import { Gift, Tag, Percent, TrendingUp } from 'lucide-react';
import { useActiveCampaigns } from '@/hooks/useCampaigns';
import { useActiveDiscounts } from '@/hooks/useDiscounts';
import BannerCarousel from '@/components/customer/BannerCarousel';

export default function OffersPage() {
  const { getActiveCampaigns } = useActiveCampaigns();
  const { getActiveDiscounts } = useActiveDiscounts();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const [campaignsResult, discountsResult] = await Promise.all([
        getActiveCampaigns(),
        getActiveDiscounts()
      ]);
      setCampaigns(campaignsResult.data || []);
      setDiscounts(discountsResult.data || []);
    } catch (error) {
      console.error('Failed to load offers:', error);
    }
  };

  return (
    <TenantCustomerLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Offers</h1>
            <p className="text-gray-600">Exclusive deals and discounts just for you</p>
          </div>

          {/* Banner Carousel */}
          <div className="mb-8">
            <BannerCarousel page="OFFERS" />
          </div>

          {/* Active Campaigns */}
          {campaigns.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="text-purple-600" size={28} />
              Active Campaigns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <Gift size={24} className="text-white" />
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Discount</p>
                      <p className="text-lg font-bold text-purple-600">
                        {campaign.discountType === 'PERCENTAGE' ? `${campaign.discountValue}%` : `₹${campaign.discountValue}`}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Discounts */}
        {discounts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Percent className="text-blue-600" size={28} />
              Available Discounts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {discounts.map((discount) => (
                <div key={discount._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag size={24} className="text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{discount.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{discount.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-50 px-3 py-1 rounded-lg">
                          <p className="text-xs text-blue-600 font-medium">
                            {discount.discountType === 'PERCENTAGE' ? `${discount.discountValue}% OFF` : `₹${discount.discountValue} OFF`}
                          </p>
                        </div>
                        {discount.minOrderValue && (
                          <p className="text-xs text-gray-500">
                            Min order: ₹{discount.minOrderValue}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {campaigns.length === 0 && discounts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Offers</h3>
            <p className="text-gray-600">Check back soon for exciting deals and discounts!</p>
          </div>
        )}
      </div>
    </div>
    </TenantCustomerLayout>
  );
}

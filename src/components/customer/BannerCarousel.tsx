'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useActiveBannersByPage, useRecordImpression, useRecordClick } from '@/hooks/useCustomerBanners';

interface BannerCarouselProps {
  page: string;
  autoPlay?: boolean;
  interval?: number;
}

export default function BannerCarousel({ page, autoPlay = true, interval = 5000 }: BannerCarouselProps) {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const { getActiveBannersByPage } = useActiveBannersByPage();
  const { recordImpression } = useRecordImpression();
  const { recordClick } = useRecordClick();
  const impressionRecorded = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadBanners();
  }, [page]);

  useEffect(() => {
    if (banners.length > 0 && autoPlay) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [banners.length, autoPlay, interval]);

  useEffect(() => {
    // Record impression when banner is displayed
    if (banners[currentIndex] && !impressionRecorded.current.has(banners[currentIndex]._id)) {
      recordImpression(banners[currentIndex]._id);
      impressionRecorded.current.add(banners[currentIndex]._id);
    }
  }, [currentIndex, banners]);

  const loadBanners = async () => {
    try {
      const result = await getActiveBannersByPage(page);
      // Extract banners from bannersByPosition object
      const bannersByPosition = result.data?.bannersByPosition || {};
      
      // Flatten all banners from all positions into a single array
      const allBanners: any[] = [];
      Object.values(bannersByPosition).forEach((positionBanners: any) => {
        if (Array.isArray(positionBanners)) {
          allBanners.push(...positionBanners);
        }
      });
      
      // Filter banners that have images (suitable for carousel)
      const carouselBanners = allBanners.filter(b => b.imageUrl);
      
      setBanners(carouselBanners);
    } catch (error) {
      console.error('Failed to load banners:', error);
      setBanners([]);
    } finally {
      setIsLoaded(true);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = async (banner: any) => {
    try {
      const result = await recordClick(banner._id);
      
      // Handle action based on banner type
      if (result.data.actionType === 'LINK' && result.data.actionUrl) {
        window.open(result.data.actionUrl, '_blank');
      } else if (result.data.actionType === 'PROMOTION' && result.data.linkedPromotion) {
        // Navigate to promotion page
        const { type, id } = result.data.linkedPromotion;
        
        // Redirect to offers page with promotion highlighted
        if (type === 'Campaign' || type === 'Coupon') {
          window.location.href = `/customer/offers?highlight=${id}`;
        } else if (type === 'Discount') {
          window.location.href = `/customer/offers?highlight=${id}`;
        } else if (type === 'Referral') {
          window.location.href = `/customer/referrals`;
        } else if (type === 'LoyaltyProgram') {
          window.location.href = `/customer/loyalty`;
        }
      }
    } catch (error) {
      console.error('Failed to handle banner click:', error);
    }
  };

  // Don't show anything until loaded, and return null if no banners
  if (!isLoaded || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  // Skip if current banner doesn't have required data
  if (!currentBanner || !currentBanner.imageUrl) {
    return null;
  }

  return (
    <div className="relative w-full group">
      {/* Banner Image */}
      <div
        className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden cursor-pointer group"
      >
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${currentBanner.imageUrl}`}
          alt={currentBanner.title || currentBanner.content?.title || 'Banner'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay with title and CTA */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
          <h3 className="text-white text-2xl font-bold mb-2">
            {currentBanner.title || currentBanner.content?.title || 'Special Offer'}
          </h3>
          {(currentBanner.description || currentBanner.content?.description) && (
            <p className="text-white/90 text-sm mb-4">
              {currentBanner.description || currentBanner.content?.description}
            </p>
          )}
          
          {/* CTA Button */}
          {(currentBanner.ctaText || currentBanner.cta?.text) && (
            <button
              onClick={() => handleBannerClick(currentBanner)}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              {currentBanner.ctaText || currentBanner.cta?.text || 'View Offer'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={24} className="text-gray-800" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={24} className="text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useActiveBanners, useRecordImpression, useRecordClick } from '@/hooks/useCustomerBanners';
import { X } from 'lucide-react';

interface Banner {
  _id: string;
  content: {
    title: string;
    subtitle?: string;
    description?: string;
    message?: string;
  };
  imageUrl?: string;
  imageAlt?: string;
  mobileImageUrl?: string;
  cta?: {
    text: string;
    link?: string;
    secondaryText?: string;
    secondaryLink?: string;
  };
  templateType: 'HERO' | 'SLIDER' | 'STRIP' | 'CARD' | 'MODAL' | 'FLOATING';
  position: string;
  linkedCampaign?: any;
}

interface BannerDisplayProps {
  position: string;
  className?: string;
}

export default function BannerDisplay({ position, className = '' }: BannerDisplayProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  
  const { getActiveBanners, loading } = useActiveBanners();
  const { recordImpression } = useRecordImpression();
  const { recordClick } = useRecordClick();

  useEffect(() => {
    loadBanners();
  }, [position]);

  useEffect(() => {
    // Record impressions for visible banners
    if (banners.length > 0 && !dismissed.has(banners[currentIndex]?._id)) {
      recordImpression(banners[currentIndex]._id);
    }
  }, [banners, currentIndex]);

  const loadBanners = async () => {
    try {
      const result = await getActiveBanners(position);
      setBanners(result.data?.banners || []);
    } catch (error) {
      console.error('Failed to load banners:', error);
    }
  };

  const handleClick = async (banner: Banner) => {
    try {
      await recordClick(banner._id);
      if (banner.cta?.link) {
        window.location.href = banner.cta.link;
      }
    } catch (error) {
      console.error('Failed to record click:', error);
    }
  };

  const handleDismiss = (bannerId: string) => {
    setDismissed(prev => new Set([...prev, bannerId]));
  };

  if (loading || banners.length === 0) return null;

  const visibleBanners = banners.filter(b => !dismissed.has(b._id));
  if (visibleBanners.length === 0) return null;

  const banner = visibleBanners[currentIndex % visibleBanners.length];

  // Render based on template type
  switch (banner.templateType) {
    case 'HERO':
      return <HeroBanner banner={banner} onClick={handleClick} className={className} />;
    
    case 'STRIP':
      return <StripBanner banner={banner} onClick={handleClick} onDismiss={handleDismiss} className={className} />;
    
    case 'FLOATING':
      return <FloatingBanner banner={banner} onClick={handleClick} onDismiss={handleDismiss} className={className} />;
    
    case 'MODAL':
      return <ModalBanner banner={banner} onClick={handleClick} onDismiss={handleDismiss} className={className} />;
    
    case 'CARD':
      return <CardBanner banner={banner} onClick={handleClick} className={className} />;
    
    case 'SLIDER':
      return (
        <SliderBanner 
          banners={visibleBanners} 
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onClick={handleClick} 
          className={className} 
        />
      );
    
    default:
      return null;
  }
}

// Hero Banner Component
function HeroBanner({ banner, onClick, className }: any) {
  return (
    <div className={`relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden ${className}`}>
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{banner.content.title}</h1>
            {banner.content.subtitle && (
              <p className="text-xl md:text-2xl mb-4 opacity-90">{banner.content.subtitle}</p>
            )}
            {banner.content.description && (
              <p className="text-lg mb-6 opacity-80">{banner.content.description}</p>
            )}
            {banner.cta && (
              <button
                onClick={() => onClick(banner)}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                {banner.cta.text}
              </button>
            )}
          </div>
          {banner.imageUrl && (
            <div className="hidden md:block">
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${banner.imageUrl}`}
                alt={banner.imageAlt || banner.content.title}
                className="rounded-lg shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Strip Banner Component
function StripBanner({ banner, onClick, onDismiss, className }: any) {
  return (
    <div className={`relative bg-gradient-to-r from-orange-500 to-pink-500 text-white ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center gap-4">
            <p className="font-semibold">{banner.content.title}</p>
            {banner.content.message && (
              <p className="text-sm opacity-90 hidden md:block">{banner.content.message}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {banner.cta && (
              <button
                onClick={() => onClick(banner)}
                className="bg-white text-orange-600 px-4 py-1.5 rounded font-medium text-sm hover:bg-gray-100 transition"
              >
                {banner.cta.text}
              </button>
            )}
            <button
              onClick={() => onDismiss(banner._id)}
              className="p-1 hover:bg-white/20 rounded transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating Banner Component
function FloatingBanner({ banner, onClick, onDismiss, className }: any) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
        <button
          onClick={() => onDismiss(banner._id)}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded transition"
        >
          <X size={16} />
        </button>
        <h3 className="font-bold text-lg mb-2 pr-6">{banner.content.title}</h3>
        {banner.content.description && (
          <p className="text-sm text-gray-600 mb-3">{banner.content.description}</p>
        )}
        {banner.cta && (
          <button
            onClick={() => onClick(banner)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
          >
            {banner.cta.text}
          </button>
        )}
      </div>
    </div>
  );
}

// Modal Banner Component
function ModalBanner({ banner, onClick, onDismiss, className }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg max-w-md w-full p-6 relative ${className}`}>
        <button
          onClick={() => onDismiss(banner._id)}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded transition"
        >
          <X size={20} />
        </button>
        {banner.imageUrl && (
          <img 
            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${banner.imageUrl}`}
            alt={banner.imageAlt || banner.content.title}
            className="w-full rounded-lg mb-4"
          />
        )}
        <h2 className="text-2xl font-bold mb-2">{banner.content.title}</h2>
        {banner.content.subtitle && (
          <p className="text-lg text-gray-700 mb-3">{banner.content.subtitle}</p>
        )}
        {banner.content.description && (
          <p className="text-gray-600 mb-4">{banner.content.description}</p>
        )}
        {banner.cta && (
          <button
            onClick={() => onClick(banner)}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {banner.cta.text}
          </button>
        )}
      </div>
    </div>
  );
}

// Card Banner Component
function CardBanner({ banner, onClick, className }: any) {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition ${className}`}>
      {banner.imageUrl && (
        <img 
          src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${banner.imageUrl}`}
          alt={banner.imageAlt || banner.content.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{banner.content.title}</h3>
        {banner.content.description && (
          <p className="text-gray-600 text-sm mb-3">{banner.content.description}</p>
        )}
        {banner.cta && (
          <button
            onClick={() => onClick(banner)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
          >
            {banner.cta.text}
          </button>
        )}
      </div>
    </div>
  );
}

// Slider Banner Component
function SliderBanner({ banners, currentIndex, setCurrentIndex, onClick, className }: any) {
  const banner = banners[currentIndex % banners.length];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev: number) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className={`relative bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg overflow-hidden ${className}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{banner.content.title}</h2>
          {banner.content.subtitle && (
            <p className="text-xl mb-4 opacity-90">{banner.content.subtitle}</p>
          )}
          {banner.content.description && (
            <p className="text-lg mb-6 opacity-80 max-w-2xl mx-auto">{banner.content.description}</p>
          )}
          {banner.cta && (
            <button
              onClick={() => onClick(banner)}
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              {banner.cta.text}
            </button>
          )}
        </div>
      </div>
      
      {/* Slider Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {banners.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition ${
              index === currentIndex % banners.length ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

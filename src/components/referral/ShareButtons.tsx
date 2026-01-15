'use client';

import { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Mail } from 'lucide-react';
import { useTrackReferralShare } from '@/hooks/useReferral';

interface ShareButtonsProps {
  code: string;
  link: string;
}

export default function ShareButtons({ code, link }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { trackShare } = useTrackReferralShare();

  const handleCopy = async () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    await trackShare('COPY');
  };

  const handleShare = async (platform: string) => {
    await trackShare(platform);
    
    const message = `Join me on LaundryLobby and get amazing discounts! Use my referral code: ${code}`;
    const encodedMessage = encodeURIComponent(message);
    const encodedLink = encodeURIComponent(link);

    switch (platform) {
      case 'WHATSAPP':
        window.open(`https://wa.me/?text=${encodedMessage}%20${encodedLink}`, '_blank');
        break;
      case 'EMAIL':
        window.open(`mailto:?subject=Join LaundryLobby&body=${encodedMessage}%20${encodedLink}`, '_blank');
        break;
      case 'SMS':
        window.open(`sms:?body=${encodedMessage}%20${encodedLink}`, '_blank');
        break;
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-3">Share via:</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
          <span className="font-medium">{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>

        <button
          onClick={() => handleShare('WHATSAPP')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
        >
          <MessageCircle size={20} />
          <span className="font-medium">WhatsApp</span>
        </button>

        <button
          onClick={() => handleShare('EMAIL')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
        >
          <Mail size={20} />
          <span className="font-medium">Email</span>
        </button>

        <button
          onClick={() => handleShare('SMS')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
        >
          <Share2 size={20} />
          <span className="font-medium">SMS</span>
        </button>
      </div>
    </div>
  );
}

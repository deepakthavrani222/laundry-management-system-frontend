'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationToastProps {
  notification: {
    _id: string;
    type: string;
    title: string;
    message: string;
    icon: string;
    severity: 'info' | 'success' | 'warning' | 'error';
    data: {
      link?: string;
      orderId?: string;
      [key: string]: any;
    };
  };
  onClose: () => void;
  duration?: number;
}

const severityConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    textColor: 'text-green-900',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    textColor: 'text-red-900',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-900',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-900',
  },
};

export default function NotificationToast({
  notification,
  onClose,
  duration = 5000,
}: NotificationToastProps) {
  const router = useRouter();
  const config = severityConfig[notification.severity];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClick = () => {
    if (notification.data.link) {
      router.push(notification.data.link);
      onClose();
    }
  };

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border-l-4 rounded-lg shadow-lg p-4 mb-3
        animate-slide-in-right
        max-w-md w-full
        cursor-pointer hover:shadow-xl transition-shadow
      `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
          <Icon size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
          <p className="text-sm opacity-90">{notification.message}</p>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

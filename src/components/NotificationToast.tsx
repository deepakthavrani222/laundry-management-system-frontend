'use client';

import { useEffect } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
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
  onAction?: (action: string) => void;
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
  onAction,
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
    console.log('🔗 Notification clicked:', {
      type: notification.type,
      data: notification.data,
      link: notification.data?.link
    });
    if (notification.data?.link) {
      console.log('🔗 Navigating to:', notification.data.link);
      router.push(notification.data.link);
      onClose();
    } else {
      console.log('⚠️ No link in notification data');
    }
  };

  const getActions = () => {
    const actions = [];

    // Order-related actions
    if (notification.type === 'order_placed' || notification.type === 'order_ready') {
      actions.push({
        label: 'View Order',
        onClick: () => {
          // Use the link from notification data if available, otherwise fallback to /admin/orders
          const link = notification.data?.link || '/admin/orders';
          console.log('📦 View Order clicked, navigating to:', link);
          router.push(link);
          onClose();
        },
      });
    }

    // Ticket-related actions
    if (notification.type === 'new_complaint') {
      actions.push({
        label: 'Reply',
        onClick: () => {
          const link = notification.data?.link || '/admin/support';
          console.log('💬 Reply clicked, navigating to:', link);
          router.push(link);
          onClose();
        },
      });
    }

    // Reward points
    if (notification.type === 'reward_points') {
      actions.push({
        label: 'View Rewards',
        onClick: () => {
          router.push('/rewards');
          onClose();
        },
      });
    }

    return actions;
  };

  const actions = getActions();

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
          
          {actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  className={`
                    px-3 py-1 text-xs font-medium rounded
                    ${config.iconColor} bg-white
                    hover:opacity-80 transition-opacity
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
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

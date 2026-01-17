import { useAuthStore } from '@/store/authStore';
import { useMemo } from 'react';

/**
 * Feature keys that can be toggled per plan
 */
export type FeatureKey =
  // Core Laundry
  | 'wash_fold'
  | 'dry_cleaning'
  | 'ironing'
  | 'express_delivery'
  | 'subscription_orders'
  // Platform - Sidebar Features
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'services'
  | 'branches'
  | 'branch_admins'
  | 'logistics'
  | 'tickets'
  | 'reviews'
  | 'refunds'
  | 'payments'
  // Programs
  | 'campaigns'
  | 'coupons'
  | 'discounts'
  | 'banners'
  | 'wallet'
  | 'referral_program'
  | 'loyalty_points'
  | 'advanced_analytics'
  | 'api_access'
  // Limits
  | 'max_orders'
  | 'max_staff'
  | 'max_customers'
  | 'max_branches'
  // Branding
  | 'custom_branding'
  | 'custom_logo'
  | 'custom_domain'
  | 'white_label'
  // Support
  | 'priority_support'
  | 'dedicated_manager';

/**
 * Hook to check tenant subscription features
 * Features are completely hidden when disabled (not shown as locked)
 */
export function useFeatures() {
  const { user } = useAuthStore();
  
  // Get features from user's tenancy subscription
  const features = useMemo(() => {
    // Priority order:
    // 1. user.features (from /permissions/sync endpoint - most up-to-date)
    // 2. user.tenancy.subscription.features
    // 3. user.subscription.features
    const directFeatures = user?.features;
    const tenancyFeatures = user?.tenancy?.subscription?.features;
    const userFeatures = user?.subscription?.features;
    
    const result = directFeatures || tenancyFeatures || userFeatures || {};
    
    // Debug log to see what features are loaded
    console.log('🎯 Features recomputed:', {
      enabledFeatures: Object.keys(result).filter(k => result[k]),
      totalFeatures: Object.keys(result).length,
      source: directFeatures ? 'user.features' : tenancyFeatures ? 'tenancy.subscription.features' : 'subscription.features'
    });
    
    return result;
  }, [user, user?.features, user?.tenancy?.subscription?.features, user?.subscription?.features]); // Add all dependencies

  /**
   * Check if a boolean feature is enabled
   */
  const hasFeature = (key: FeatureKey): boolean => {
    const value = features[key];
    
    // For boolean features
    if (typeof value === 'boolean') return value;
    
    // For number features (limits), check if > 0 or -1 (unlimited)
    if (typeof value === 'number') return value !== 0;
    
    // Default to false if feature not defined
    return false;
  };

  /**
   * Get the value of a limit feature
   * Returns -1 for unlimited, 0 if not available
   */
  const getLimit = (key: FeatureKey): number => {
    const value = features[key];
    if (typeof value === 'number') return value;
    return 0;
  };

  /**
   * Check if a limit is exceeded
   */
  const isLimitExceeded = (key: FeatureKey, currentCount: number): boolean => {
    const limit = getLimit(key);
    if (limit === -1) return false; // Unlimited
    return currentCount >= limit;
  };

  /**
   * Check if user can perform an action based on limits
   */
  const canPerformAction = (key: FeatureKey, currentCount: number): boolean => {
    return !isLimitExceeded(key, currentCount);
  };

  /**
   * Get remaining quota for a limit
   */
  const getRemainingQuota = (key: FeatureKey, currentCount: number): number | 'unlimited' => {
    const limit = getLimit(key);
    if (limit === -1) return 'unlimited';
    return Math.max(0, limit - currentCount);
  };

  /**
   * Get the current plan name
   */
  const planName = useMemo(() => {
    return user?.tenancy?.subscription?.plan || user?.subscription?.plan || 'free';
  }, [user]);

  /**
   * Check if subscription is active
   */
  const isSubscriptionActive = useMemo(() => {
    const status = user?.tenancy?.subscription?.status || user?.subscription?.status;
    return status === 'active' || status === 'trial';
  }, [user]);

  /**
   * Check if in trial period
   */
  const isTrialPeriod = useMemo(() => {
    const status = user?.tenancy?.subscription?.status || user?.subscription?.status;
    return status === 'trial';
  }, [user]);

  /**
   * Get trial end date
   */
  const trialEndsAt = useMemo(() => {
    const date = user?.tenancy?.subscription?.trialEndsAt || user?.subscription?.trialEndsAt;
    return date ? new Date(date) : null;
  }, [user]);

  return {
    features,
    hasFeature,
    getLimit,
    isLimitExceeded,
    canPerformAction,
    getRemainingQuota,
    planName,
    isSubscriptionActive,
    isTrialPeriod,
    trialEndsAt,
  };
}

/**
 * Feature-to-route mapping for sidebar filtering
 */
export const featureRouteMapping: Record<string, FeatureKey> = {
  '/admin/campaigns': 'campaigns',
  '/admin/banners': 'banners',
  '/admin/coupons': 'coupons',
  '/admin/referrals': 'referral_program',
  '/admin/loyalty': 'loyalty_points',
  '/admin/wallet': 'wallet',
  '/admin/analytics': 'advanced_analytics',
};

/**
 * Check if a route should be visible based on features
 */
export function shouldShowRoute(href: string, hasFeature: (key: FeatureKey) => boolean): boolean {
  const featureKey = featureRouteMapping[href];
  if (!featureKey) return true; // No feature restriction
  return hasFeature(featureKey);
}

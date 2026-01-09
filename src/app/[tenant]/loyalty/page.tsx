'use client';

import TenantCustomerLayout from '@/components/layout/TenantCustomerLayout';
import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';

export default function LoyaltyPage() {
  return (
    <TenantCustomerLayout>
      <LoyaltyDashboard />
    </TenantCustomerLayout>
  );
}

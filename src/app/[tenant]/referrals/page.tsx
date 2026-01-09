'use client';

import TenantCustomerLayout from '@/components/layout/TenantCustomerLayout';
import ReferralDashboard from '@/components/referral/ReferralDashboard';

export default function ReferralsPage() {
  return (
    <TenantCustomerLayout>
      <ReferralDashboard />
    </TenantCustomerLayout>
  );
}

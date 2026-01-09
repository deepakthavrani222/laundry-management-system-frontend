'use client';

import TenantCustomerLayout from '@/components/layout/TenantCustomerLayout';
import WalletDashboard from '@/components/wallet/WalletDashboard';

export default function WalletPage() {
  return (
    <TenantCustomerLayout>
      <WalletDashboard />
    </TenantCustomerLayout>
  );
}

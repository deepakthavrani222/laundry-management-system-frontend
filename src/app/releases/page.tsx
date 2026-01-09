import { APP_VERSION } from '@/lib/version';

export default function ReleasesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Release Notes
          </h1>
          <p className="text-lg text-gray-600">
            Laundry Management System - Version History
          </p>
          <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
            Current Version: {APP_VERSION}
          </div>
        </div>

        {/* Release Timeline */}
        <div className="space-y-8">
          {/* Version 2.0.0 */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">v2.0.0</h2>
              <span className="text-sm text-gray-500">January 9, 2026</span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">✨ Added</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Complete banner management system with QR codes and barcodes</li>
                  <li>Admin can create template-based banners</li>
                  <li>SuperAdmin can create global banners</li>
                  <li>Support for multiple promotion types (campaigns, discounts, coupons, referrals, loyalty)</li>
                  <li>Banner display on customer frontend with multiple positions</li>
                  <li>Barcode display in order lists (admin and customer)</li>
                  <li>Tenant-aware navigation system</li>
                  <li>Version management system</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">🐛 Fixed</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Banner cache headers to prevent stale data</li>
                  <li>Tenant navigation breaking out of context</li>
                  <li>Toast import case sensitivity issue</li>
                  <li>Campaign analytics page build error</li>
                  <li>Banner validation for optional campaigns</li>
                  <li>Image URL handling in banner creation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-600 mb-2">🔄 Changed</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Moved Campaigns and Banners to Programs section in admin sidebar</li>
                  <li>Moved Campaigns and Banners to Global Programs in SuperAdmin sidebar</li>
                  <li>Updated banner API to support multiple promotion types</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">⚙️ Technical</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Added cache-control headers to customer banner endpoints</li>
                  <li>Implemented URL-based tenant detection as fallback</li>
                  <li>Created tenant layout for automatic context provision</li>
                  <li>Updated OrderQRCode component with multiple display modes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Version 0.1.0 */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">v0.1.0</h2>
              <span className="text-sm text-gray-500">December 2025</span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">✨ Added</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Initial project setup</li>
                  <li>Basic order management</li>
                  <li>Customer and admin dashboards</li>
                  <li>Authentication system</li>
                  <li>Multi-tenancy support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

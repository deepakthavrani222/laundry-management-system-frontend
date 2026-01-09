import { APP_VERSION } from '@/lib/version';

export default function VersionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Laundry Management System
        </h1>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-semibold">Version:</span> {APP_VERSION}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Frontend:</span> Admin & Customer Portal
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Build:</span> {new Date().toISOString()}
          </p>
        </div>
        <div className="mt-6 space-y-2">
          <a
            href="/"
            className="block w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Go to Home
          </a>
          <a
            href="/releases"
            className="block w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
          >
            View All Releases
          </a>
        </div>
      </div>
    </div>
  );
}

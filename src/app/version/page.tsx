import { APP_VERSION } from '@/lib/version';

export default function VersionPage({
  searchParams,
}: {
  searchParams: { requested?: string };
}) {
  const requestedVersion = searchParams.requested;

  if (requestedVersion && requestedVersion !== APP_VERSION) {
    // Show version mismatch
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Version Mismatch
            </h1>
            <p className="text-gray-600 mb-4">
              You requested version <span className="font-mono font-semibold text-blue-600">{requestedVersion}</span>
            </p>
            <p className="text-gray-600 mb-6">
              Current running version is <span className="font-mono font-semibold text-green-600">{APP_VERSION}</span>
            </p>
          </div>
          
          <div className="space-y-3">
            <a
              href={`/${APP_VERSION}`}
              className="block w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Current Version ({APP_VERSION})
            </a>
            <a
              href="/releases"
              className="block w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              View All Releases
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show current version info
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

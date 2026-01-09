'use client';

import { X } from 'lucide-react';

interface BannerPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  banner: any;
}

export default function BannerPreview({ isOpen, onClose, banner }: BannerPreviewProps) {
  if (!isOpen || !banner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Banner Preview</h2>
            <p className="text-sm text-gray-600">{banner.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Desktop Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Desktop View</h3>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${banner.imageUrl}`}
                alt={banner.title}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Mobile Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Mobile View</h3>
            <div className="max-w-sm mx-auto border border-gray-300 rounded-lg overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${banner.imageUrl}`}
                alt={banner.title}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Banner Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Banner Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{banner.type}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium">{banner.status}</span>
              </div>
              <div>
                <span className="text-gray-600">Target Pages:</span>
                <span className="ml-2 font-medium">{banner.targetPages?.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-600">Priority:</span>
                <span className="ml-2 font-medium">{banner.priority}</span>
              </div>
              {banner.description && (
                <div className="col-span-2">
                  <span className="text-gray-600">Description:</span>
                  <p className="mt-1 text-gray-900">{banner.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

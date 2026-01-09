'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, BarChart3, Power } from 'lucide-react';
import { useTenantBanners, useDeleteBanner, useToggleBannerStatus } from '@/hooks/useBanners';
import CreateTemplateBannerModal from '@/components/banners/CreateTemplateBannerModal';
import EditBannerModal from '@/components/banners/EditBannerModal';
import BannerAnalyticsDashboard from '@/components/banners/BannerAnalyticsDashboard';
import BannerPreview from '@/components/banners/BannerPreview';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function AdminBannersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [pageFilter, setPageFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; bannerId: string; title: string; message: string } | null>(null);

  const { getBanners, loading } = useTenantBanners();
  const { deleteBanner } = useDeleteBanner();
  const { toggleStatus } = useToggleBannerStatus();

  useEffect(() => {
    loadBanners();
  }, [currentPage, searchTerm, statusFilter, typeFilter, pageFilter]);

  const loadBanners = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: 10
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (pageFilter !== 'ALL') params.targetPage = pageFilter;

      const result = await getBanners(params);
      console.log('API Response:', result); // Debug log
      setBanners(result.data?.banners || []);
      setTotalPages(result.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load banners:', error);
      setToast({ message: 'Failed to load banners', type: 'error' });
    }
  };

  const handleDelete = async (bannerId: string) => {
    setConfirmDialog({
      isOpen: true,
      bannerId,
      title: 'Delete Banner',
      message: 'Are you sure you want to delete this banner? This action cannot be undone.'
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog) return;
    
    try {
      await deleteBanner(confirmDialog.bannerId);
      setToast({ message: 'Banner deleted successfully', type: 'success' });
      loadBanners();
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || 'Failed to delete banner', type: 'error' });
    } finally {
      setConfirmDialog(null);
    }
  };

  const handleToggleStatus = async (banner: any) => {
    try {
      const result = await toggleStatus(banner._id, banner.state);
      setToast({ message: result.message || 'Banner status updated', type: 'success' });
      loadBanners();
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || 'Failed to toggle status', type: 'error' });
    }
  };

  const handleEdit = (banner: any) => {
    setSelectedBanner(banner);
    setShowEditModal(true);
  };

  const handleViewAnalytics = (banner: any) => {
    setSelectedBanner(banner);
    setShowAnalytics(true);
  };

  const handlePreview = (banner: any) => {
    setSelectedBanner(banner);
    setShowPreview(true);
  };

  const filteredBanners = banners.filter(banner => {
    const title = banner.content?.title || banner.title || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || banner.state === statusFilter;
    const matchesType = typeFilter === 'ALL' || banner.templateType === typeFilter;
    const matchesPage = pageFilter === 'ALL' || banner.position === pageFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPage;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      ARCHIVED: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600 mt-1">Create and manage promotional banners</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Create Banner
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PAUSED">Paused</option>
            <option value="EXPIRED">Expired</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Types</option>
            <option value="PROMOTIONAL">Promotional</option>
            <option value="INFORMATIONAL">Informational</option>
            <option value="SEASONAL">Seasonal</option>
            <option value="ANNOUNCEMENT">Announcement</option>
          </select>

          {/* Page Filter */}
          <select
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Pages</option>
            <option value="HOME">Home</option>
            <option value="SERVICES">Services</option>
            <option value="CHECKOUT">Checkout</option>
            <option value="DASHBOARD">Dashboard</option>
            <option value="ORDERS">Orders</option>
          </select>
        </div>
      </div>

      {/* Banner List */}
      <div className="space-y-4">
        {filteredBanners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No banners found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first banner
            </button>
          </div>
        ) : (
          filteredBanners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{banner.content?.title || 'Untitled'}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(banner.state || 'DRAFT')}`}>
                      {banner.state || 'DRAFT'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {banner.templateType || 'UNKNOWN'}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <span>📅 {new Date(banner.schedule?.startDate).toLocaleDateString()} - {new Date(banner.schedule?.endDate).toLocaleDateString()}</span>
                    <span>📍 {banner.position || 'No position'}</span>
                    {banner.linkedCampaign && (
                      <span>🔗 Linked to Campaign</span>
                    )}
                  </div>

                  {/* Analytics Preview */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Impressions</p>
                      <p className="text-lg font-bold text-blue-600">{(banner.analytics?.impressions || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Clicks</p>
                      <p className="text-lg font-bold text-green-600">{(banner.analytics?.clicks || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">CTR</p>
                      <p className="text-lg font-bold text-purple-600">
                        {banner.analytics?.impressions > 0 
                          ? ((banner.analytics.clicks / banner.analytics.impressions) * 100).toFixed(2)
                          : '0.00'}%
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Conversions</p>
                      <p className="text-lg font-bold text-orange-600">{banner.analytics?.conversions || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handlePreview(banner)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="Preview"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleViewAnalytics(banner)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Analytics"
                  >
                    <BarChart3 size={20} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                    title={banner.state === 'DRAFT' ? 'Submit for Approval' : banner.state === 'ACTIVE' ? 'Pause' : 'Resume'}
                  >
                    <Power size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredBanners.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg transition ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTemplateBannerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadBanners();
          setToast({ message: 'Banner created successfully', type: 'success' });
        }}
      />

      {selectedBanner && (
        <>
          <EditBannerModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedBanner(null);
            }}
            onSuccess={() => {
              loadBanners();
              setToast({ message: 'Banner updated successfully', type: 'success' });
            }}
            banner={selectedBanner}
          />

          <BannerAnalyticsDashboard
            isOpen={showAnalytics}
            onClose={() => {
              setShowAnalytics(false);
              setSelectedBanner(null);
            }}
            bannerId={selectedBanner._id}
            bannerTitle={selectedBanner.title}
          />

          <BannerPreview
            isOpen={showPreview}
            onClose={() => {
              setShowPreview(false);
              setSelectedBanner(null);
            }}
            banner={selectedBanner}
          />
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}

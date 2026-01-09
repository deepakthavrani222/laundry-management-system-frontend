'use client';

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface Template {
  _id: string;
  name: string;
  type: string;
  description: string;
  allowedPositions: string[];
}

interface Promotion {
  id: string;
  type: string;
  name: string;
  description: string;
  status?: string;
}

interface CreateTemplateBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTemplateBannerModal({ isOpen, onClose, onSuccess }: CreateTemplateBannerModalProps) {
  const { token } = useAuthStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [promotions, setPromotions] = useState<{
    campaigns: Promotion[];
    discounts: Promotion[];
    coupons: Promotion[];
    referrals: Promotion[];
    loyalty: Promotion[];
  }>({
    campaigns: [],
    discounts: [],
    coupons: [],
    referrals: [],
    loyalty: []
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    templateId: '',
    position: '',
    title: '',
    subtitle: '',
    description: '',
    message: '',
    imageUrl: '',
    imageAlt: '',
    promotionType: 'none',
    promotionId: '',
    ctaText: 'Learn More',
    ctaLink: '',
    priority: 5,
    startDate: '',
    endDate: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchPromotions();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/banners/templates/available`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTemplates(response.data.data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const fetchPromotions = async () => {
    try {
      console.log('🔍 Fetching all promotions...');
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/admin/banners/promotions/all`);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/banners/promotions/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('📦 Full API Response:', response.data);
      console.log('📊 Response Status:', response.status);
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        console.log('✅ Promotions Data Structure:', {
          campaigns: data.campaigns?.length || 0,
          discounts: data.discounts?.length || 0,
          coupons: data.coupons?.length || 0,
          referrals: data.referrals?.length || 0,
          loyalty: data.loyalty?.length || 0
        });
        
        // Log first item of each type for debugging
        if (data.campaigns?.length > 0) console.log('Sample Campaign:', data.campaigns[0]);
        if (data.discounts?.length > 0) console.log('Sample Discount:', data.discounts[0]);
        if (data.coupons?.length > 0) console.log('Sample Coupon:', data.coupons[0]);
        if (data.referrals?.length > 0) console.log('Sample Referral:', data.referrals[0]);
        if (data.loyalty?.length > 0) console.log('Sample Loyalty:', data.loyalty[0]);
        
        setPromotions(data);
        console.log('✅ Promotions loaded successfully');
      } else {
        console.warn('⚠️ Promotions response missing data');
        setPromotions({
          campaigns: [],
          discounts: [],
          coupons: [],
          referrals: [],
          loyalty: []
        });
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch promotions:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Set empty arrays so form still works
      setPromotions({
        campaigns: [],
        discounts: [],
        coupons: [],
        referrals: [],
        loyalty: []
      });
      
      // Show warning but don't block form
      toast.error('Some promotions could not be loaded. You can still create informational banners.');
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    setSelectedTemplate(template || null);
    setFormData({ ...formData, templateId, position: '' });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const imageFormData = new FormData();
    imageFormData.append('image', imageFile);

    try {
      setUploading(true);
      console.log('Uploading image...');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/banners/upload-image`,
        imageFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log('Image uploaded, URL:', response.data.data.url);
      return response.data.data.url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload image if selected
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('Final image URL to submit:', imageUrl);
        }
      }

      // Prepare banner data
      const bannerData: any = {
        templateId: formData.templateId,
        position: formData.position,
        content: {
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          message: formData.message
        },
        cta: {
          text: formData.ctaText,
          link: formData.ctaLink
        },
        priority: formData.priority,
        schedule: {
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          autoActivate: true,
          autoComplete: true
        }
      };

      // Add image URL if available
      if (imageUrl) {
        bannerData.imageUrl = imageUrl;
        bannerData.imageAlt = formData.imageAlt || formData.title;
      }

      // Add promotion linking
      if (formData.promotionType !== 'none' && formData.promotionId) {
        bannerData.linkedPromotion = {
          type: formData.promotionType,
          id: formData.promotionId
        };
        
        // Backward compatibility for campaigns
        if (formData.promotionType === 'campaign') {
          bannerData.linkedCampaign = formData.promotionId;
        }
      }

      console.log('Submitting banner data:', JSON.stringify(bannerData, null, 2));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/banners`,
        bannerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Banner created successfully!');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Failed to create banner:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create banner');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      templateId: '',
      position: '',
      title: '',
      subtitle: '',
      description: '',
      message: '',
      imageUrl: '',
      imageAlt: '',
      promotionType: 'none',
      promotionId: '',
      ctaText: 'Learn More',
      ctaLink: '',
      priority: 5,
      startDate: '',
      endDate: ''
    });
    setImageFile(null);
    setImagePreview('');
    setSelectedTemplate(null);
  };

  const getPromotionOptions = () => {
    switch (formData.promotionType) {
      case 'campaign':
        return promotions.campaigns;
      case 'discount':
        return promotions.discounts;
      case 'coupon':
        return promotions.coupons;
      case 'referral':
        return promotions.referrals;
      case 'loyalty':
        return promotions.loyalty;
      default:
        return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Create Banner</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Template *
            </label>
            <select
              value={formData.templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              required
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name} ({template.type})
                </option>
              ))}
            </select>
          </div>

          {/* Position Selection */}
          {selectedTemplate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position *
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                required
              >
                <option value="">Select position</option>
                {selectedTemplate.allowedPositions.map((position) => (
                  <option key={position} value={position}>
                    {position.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Promotion Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Promotion (Optional)
            </label>
            <select
              value={formData.promotionType}
              onChange={(e) => setFormData({ ...formData, promotionType: e.target.value, promotionId: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="none">No Promotion (Informational Banner)</option>
              <option value="campaign">Campaign</option>
              <option value="discount">Discount</option>
              <option value="coupon">Coupon</option>
              <option value="referral">Referral Program</option>
              <option value="loyalty">Loyalty Program</option>
            </select>
          </div>

          {/* Promotion Selection */}
          {formData.promotionType !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select {formData.promotionType.charAt(0).toUpperCase() + formData.promotionType.slice(1)}
              </label>
              <select
                value={formData.promotionId}
                onChange={(e) => setFormData({ ...formData, promotionId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Select {formData.promotionType}</option>
                {getPromotionOptions().map((promo) => (
                  <option key={promo.id} value={promo.id}>
                    {promo.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Content Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                rows={2}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer py-4">
                  <Upload size={32} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600">Click to upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Link
              </label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="/services"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : uploading ? 'Uploading...' : 'Create Banner'}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}

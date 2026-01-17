'use client';

import { useState, useRef, useEffect } from 'react';
import { useBranding, BrandingData, LandingPageTemplate } from '@/hooks/useBranding';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { 
  Palette, 
  Upload, 
  Trash2, 
  Save,
  Image as ImageIcon,
  Layout,
  Check,
  ExternalLink,
  Eye,
  X
} from 'lucide-react';

// Dynamic imports for templates
const OriginalTemplate = dynamic(() => import('@/components/landing/templates/OriginalTemplate'), { ssr: false });
const MinimalTemplate = dynamic(() => import('@/components/landing/templates/MinimalTemplate'), { ssr: false });
const FreshSpinTemplate = dynamic(() => import('@/components/landing/templates/FreshSpinTemplate'), { ssr: false });
const LaundryMasterTemplate = dynamic(() => import('@/components/landing/templates/LaundryMasterTemplate'), { ssr: false });

type ThemeColorOption = 'teal' | 'blue' | 'purple' | 'orange';

const themeColors: { value: ThemeColorOption; label: string; colors: { primary: string; secondary: string } }[] = [
  { value: 'teal', label: 'Teal', colors: { primary: 'bg-teal-500', secondary: 'bg-cyan-400' } },
  { value: 'blue', label: 'Blue', colors: { primary: 'bg-blue-500', secondary: 'bg-indigo-500' } },
  { value: 'purple', label: 'Purple', colors: { primary: 'bg-purple-500', secondary: 'bg-pink-500' } },
  { value: 'orange', label: 'Orange', colors: { primary: 'bg-orange-500', secondary: 'bg-red-400' } },
];

const landingTemplates: { value: LandingPageTemplate; label: string; description: string }[] = [
  { value: 'original', label: 'Original', description: 'Classic professional design' },
  { value: 'minimal', label: 'Minimal', description: 'Clean and simple layout' },
  { value: 'freshspin', label: 'Fresh Spin', description: 'Vibrant and energetic' },
  { value: 'starter', label: 'Laundry Master', description: 'Feature-rich premium' },
];

export default function BrandingPage() {
  const { branding, loading, saving, updateBranding, uploadLogo, uploadSecondaryLogo, removeLogo } = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const secondaryLogoInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<BrandingData>({
    businessName: '',
    tagline: '',
    slogan: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
      whatsapp: '',
    },
    primaryColor: '#14b8a6',
    secondaryColor: '#0d9488',
    accentColor: '#2dd4bf',
    fontFamily: 'Inter',
    landingPageTemplate: 'original',
    customCss: '',
  });

  const [selectedThemeColor, setSelectedThemeColor] = useState<ThemeColorOption>('teal');
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<LandingPageTemplate>('original');

  // Update form when branding loads
  useEffect(() => {
    if (branding?.branding) {
      setFormData({
        businessName: branding.branding.businessName || '',
        tagline: branding.branding.tagline || '',
        slogan: branding.branding.slogan || '',
        socialMedia: {
          facebook: branding.branding.socialMedia?.facebook || '',
          instagram: branding.branding.socialMedia?.instagram || '',
          twitter: branding.branding.socialMedia?.twitter || '',
          linkedin: branding.branding.socialMedia?.linkedin || '',
          youtube: branding.branding.socialMedia?.youtube || '',
          whatsapp: branding.branding.socialMedia?.whatsapp || '',
        },
        primaryColor: branding.branding.theme?.primaryColor || '#14b8a6',
        secondaryColor: branding.branding.theme?.secondaryColor || '#0d9488',
        accentColor: branding.branding.theme?.accentColor || '#2dd4bf',
        fontFamily: branding.branding.theme?.fontFamily || 'Inter',
        landingPageTemplate: branding.branding.landingPageTemplate || 'original',
        customCss: branding.branding.customCss || '',
      });
      
      // Detect current theme color
      const primaryColor = branding.branding.theme?.primaryColor;
      if (primaryColor === '#14b8a6') setSelectedThemeColor('teal');
      else if (primaryColor === '#3b82f6') setSelectedThemeColor('blue');
      else if (primaryColor === '#8b5cf6') setSelectedThemeColor('purple');
      else if (primaryColor === '#f97316') setSelectedThemeColor('orange');
    }
  }, [branding]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
        toast.error('Only PNG, JPG, and SVG files are allowed');
        return;
      }
      await uploadLogo(file);
    }
  };

  const handleSecondaryLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
        toast.error('Only PNG, JPG, and SVG files are allowed');
        return;
      }
      await uploadSecondaryLogo(file);
    }
  };

  const handleThemeColorChange = (color: ThemeColorOption) => {
    setSelectedThemeColor(color);
    
    const colorMap = {
      teal: { primary: '#14b8a6', secondary: '#0d9488', accent: '#2dd4bf' },
      blue: { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa' },
      purple: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
      orange: { primary: '#f97316', secondary: '#ea580c', accent: '#fb923c' },
    };
    
    const colors = colorMap[color];
    setFormData({ 
      ...formData, 
      primaryColor: colors.primary, 
      secondaryColor: colors.secondary, 
      accentColor: colors.accent 
    });
    
    // Also update localStorage for immediate effect on landing page
    localStorage.setItem('landing_color', color);
    window.dispatchEvent(new CustomEvent('themeColorChange', { detail: { color } }));
  };

  const handleSave = async () => {
    await updateBranding(formData);
  };

  // Map theme color to ThemeColor type
  const mapToThemeColor = (color: ThemeColorOption): 'teal' | 'blue' | 'purple' | 'orange' => {
    return color;
  };

  // Preview functions
  const handlePreview = (template: LandingPageTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  // Render preview template
  const renderPreviewTemplate = () => {
    const templateProps = {
      themeColor: mapToThemeColor(selectedThemeColor),
      language: 'en' as const,
      isAuthenticated: false,
      onBookNow: () => {},
      user: null,
      tenantName: branding?.name || 'Demo Laundry',
      tenantLogo: logoUrl,
      tenantSecondaryLogo: secondaryLogoUrl,
      tenantBusinessName: formData.businessName || branding?.name || 'Demo Laundry',
      tenantTagline: formData.tagline,
      tenantSlogan: formData.slogan,
      tenantSocialMedia: formData.socialMedia,
      isTenantPage: true,
      tenancyId: 'preview',
    };

    switch (previewTemplate) {
      case 'minimal':
        return <MinimalTemplate {...templateProps} />;
      case 'freshspin':
        return <FreshSpinTemplate {...templateProps} />;
      case 'starter':
        return <LaundryMasterTemplate {...templateProps} />;
      case 'original':
      default:
        return <OriginalTemplate {...templateProps} />;
    }
  };

  const logoUrl = branding?.branding?.logo?.url;
  const secondaryLogoUrl = branding?.branding?.secondaryLogo?.url;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branding</h1>
          <p className="text-gray-500">Customize your laundry portal appearance</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Preview URL */}
      {branding?.slug && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <strong>Customer Landing Page:</strong>
            <a 
              href={`/${branding.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline flex items-center gap-1"
            >
              {typeof window !== 'undefined' ? window.location.origin : ''}/{branding.slug}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business Identity Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Business Identity</CardTitle>
            <CardDescription>Define your business name, tagline, and slogan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <input
                id="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Fresh Laundry Services"
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will appear on your website and communications
              </p>
            </div>
            
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <input
                id="tagline"
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Clean Clothes, Happy You!"
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                A catchy phrase that describes your service
              </p>
            </div>
            
            <div>
              <Label htmlFor="slogan">Slogan</Label>
              <input
                id="slogan"
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                placeholder="Your Trusted Laundry Partner"
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your brand promise or mission statement
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Logo
            </CardTitle>
            <CardDescription>Upload your business logo (PNG, JPG, SVG - max 2MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
                {logoUrl && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={removeLogo}
                    disabled={saving}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Secondary Logo
            </CardTitle>
            <CardDescription>Alternative logo for dark backgrounds (PNG, JPG, SVG - max 2MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {secondaryLogoUrl ? (
                  <img 
                    src={secondaryLogoUrl} 
                    alt="Secondary Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  ref={secondaryLogoInputRef}
                  onChange={handleSecondaryLogoChange}
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => secondaryLogoInputRef.current?.click()}
                  disabled={saving}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Secondary Logo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Color Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Color
            </CardTitle>
            <CardDescription>Choose a color theme for your landing page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {themeColors.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleThemeColorChange(theme.value)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedThemeColor === theme.value 
                      ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400' 
                      : 'border-gray-200'
                  }`}
                  title={theme.label}
                >
                  <div className="w-full h-full flex">
                    <div className={`w-1/2 h-full ${theme.colors.primary}`} />
                    <div className={`w-1/2 h-full ${theme.colors.secondary}`} />
                  </div>
                  {selectedThemeColor === theme.value && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3 capitalize">
              Selected: <span className="font-medium">{selectedThemeColor}</span>
            </p>
          </CardContent>
        </Card>

        {/* Landing Page Template Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Landing Page Template
            </CardTitle>
            <CardDescription>Choose a landing page design for your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {landingTemplates.map((template) => (
                <div key={template.value} className="relative">
                  <button
                    onClick={() => setFormData({ ...formData, landingPageTemplate: template.value })}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                      formData.landingPageTemplate === template.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {formData.landingPageTemplate === template.value && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-5 w-5 text-blue-500" />
                      </div>
                    )}
                    <div>
                      <div 
                        className={`w-full h-16 rounded-lg mb-3 flex items-center justify-center ${
                          formData.landingPageTemplate === template.value 
                            ? 'bg-blue-100' 
                            : 'bg-gray-100'
                        }`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(template.value);
                          }}
                          className={`h-12 px-4 ${
                            formData.landingPageTemplate === template.value 
                              ? 'text-blue-500 hover:text-blue-600' 
                              : 'text-gray-500 hover:text-gray-600'
                          }`}
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          Preview
                        </Button>
                      </div>
                      <h3 className={`font-semibold ${
                        formData.landingPageTemplate === template.value ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {template.label}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Connect your social media profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <input
                  id="facebook"
                  type="url"
                  value={formData.socialMedia?.facebook}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                  })}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <input
                  id="instagram"
                  type="url"
                  value={formData.socialMedia?.instagram}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/yourpage"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <input
                  id="twitter"
                  type="url"
                  value={formData.socialMedia?.twitter}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/yourpage"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <input
                  id="linkedin"
                  type="url"
                  value={formData.socialMedia?.linkedin}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/company/yourpage"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <input
                  id="youtube"
                  type="url"
                  value={formData.socialMedia?.youtube}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, youtube: e.target.value }
                  })}
                  placeholder="https://youtube.com/@yourpage"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <input
                  id="whatsapp"
                  type="tel"
                  value={formData.socialMedia?.whatsapp}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, whatsapp: e.target.value }
                  })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4"
          onClick={closePreview}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-4xl lg:max-w-5xl h-[70vh] sm:h-[75vh] flex flex-col shadow-2xl mx-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <Layout className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">
                  Template Preview: {landingTemplates.find(t => t.value === previewTemplate)?.label}
                </h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {selectedThemeColor} theme
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={closePreview}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Preview Content - Contained within modal */}
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 overflow-auto">
                <div 
                  className="w-full h-full template-preview-wrapper" 
                  style={{ 
                    minHeight: '100%',
                    position: 'relative'
                  }}
                >
                  {renderPreviewTemplate()}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t bg-white flex items-center justify-between rounded-b-lg">
              <div className="text-sm text-gray-600">
                Preview shows live data from your branding form
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={closePreview}>
                  Close Preview
                </Button>
                <Button 
                  onClick={() => {
                    setFormData({ ...formData, landingPageTemplate: previewTemplate });
                    closePreview();
                  }}
                >
                  Use This Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

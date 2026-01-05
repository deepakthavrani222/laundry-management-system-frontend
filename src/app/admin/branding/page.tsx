'use client';

import { useState, useRef, useEffect } from 'react';
import { useBranding, BrandingData, LandingPageTemplate } from '@/hooks/useBranding';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Palette, 
  Upload, 
  Trash2, 
  Save,
  Image as ImageIcon,
  Layout,
  Check,
  ExternalLink
} from 'lucide-react';

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
  const { branding, loading, saving, updateBranding, uploadLogo, removeLogo } = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<BrandingData>({
    primaryColor: '#14b8a6',
    secondaryColor: '#0d9488',
    accentColor: '#2dd4bf',
    fontFamily: 'Inter',
    landingPageTemplate: 'original',
    customCss: '',
  });

  const [selectedThemeColor, setSelectedThemeColor] = useState<ThemeColorOption>('teal');

  // Update form when branding loads
  useEffect(() => {
    if (branding?.branding) {
      setFormData({
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
        alert('File size must be less than 2MB');
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
        alert('Only PNG, JPG, and SVG files are allowed');
        return;
      }
      await uploadLogo(file);
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

  const logoUrl = branding?.branding?.logo?.url;

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
                <button
                  key={template.value}
                  onClick={() => setFormData({ ...formData, landingPageTemplate: template.value })}
                  className={`relative p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
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
                      <Layout 
                        className={`h-8 w-8 ${
                          formData.landingPageTemplate === template.value 
                            ? 'text-blue-500' 
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <h3 className={`font-semibold ${
                      formData.landingPageTemplate === template.value ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {template.label}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

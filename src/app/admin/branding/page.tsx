'use client';

import { useState, useRef, useEffect } from 'react';
import { useBranding, BrandingData } from '@/hooks/useBranding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Palette, 
  Upload, 
  Trash2, 
  Eye, 
  Save,
  Image as ImageIcon,
  Type,
  Sparkles
} from 'lucide-react';

const fontOptions = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)' },
  { value: 'Poppins', label: 'Poppins (Geometric)' },
  { value: 'Lato', label: 'Lato (Professional)' },
  { value: 'Montserrat', label: 'Montserrat (Elegant)' },
];

const colorPresets = [
  { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' },
  { name: 'Forest Green', primary: '#22C55E', secondary: '#166534', accent: '#86EFAC' },
  { name: 'Royal Purple', primary: '#8B5CF6', secondary: '#5B21B6', accent: '#C4B5FD' },
  { name: 'Sunset Orange', primary: '#F97316', secondary: '#C2410C', accent: '#FDBA74' },
  { name: 'Rose Pink', primary: '#EC4899', secondary: '#BE185D', accent: '#F9A8D4' },
  { name: 'Slate Gray', primary: '#64748B', secondary: '#334155', accent: '#94A3B8' },
];

export default function BrandingPage() {
  const { branding, loading, saving, updateBranding, uploadLogo, removeLogo } = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<BrandingData>({
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#60A5FA',
    fontFamily: 'Inter',
    customCss: '',
  });

  // Update form when branding loads
  useEffect(() => {
    if (branding?.branding?.theme) {
      setFormData({
        primaryColor: branding.branding.theme.primaryColor || '#3B82F6',
        secondaryColor: branding.branding.theme.secondaryColor || '#1E40AF',
        accentColor: branding.branding.theme.accentColor || '#60A5FA',
        fontFamily: branding.branding.theme.fontFamily || 'Inter',
        customCss: branding.branding.customCss || '',
      });
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

  const handleSave = async () => {
    await updateBranding(formData);
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setFormData({
      ...formData,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branding</h1>
          <p className="text-gray-500">Customize your laundry portal appearance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {branding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Your Portal:</strong>{' '}
            <code className="bg-blue-100 px-2 py-1 rounded">
              {branding.subdomain}.laundry-platform.com
            </code>
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

        {/* Font Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography
            </CardTitle>
            <CardDescription>Choose a font family for your portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select 
                value={formData.fontFamily} 
                onValueChange={(value) => setFormData({ ...formData, fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Colors
            </CardTitle>
            <CardDescription>Set your brand colors or choose a preset</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color Presets */}
            <div>
              <Label className="mb-3 block">Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-sm">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    placeholder="#1E40AF"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="accentColor"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    placeholder="#60A5FA"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom CSS Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Advanced Customization
            </CardTitle>
            <CardDescription>Add custom CSS for advanced styling (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.customCss}
              onChange={(e) => setFormData({ ...formData, customCss: e.target.value })}
              placeholder={`/* Custom CSS */\n.header {\n  border-radius: 12px;\n}`}
              className="font-mono text-sm min-h-[120px]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>See how your branding will look to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="border rounded-lg overflow-hidden"
              style={{ fontFamily: formData.fontFamily }}
            >
              {/* Mock Header */}
              <div 
                className="p-4 text-white flex items-center justify-between"
                style={{ backgroundColor: formData.primaryColor }}
              >
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="h-8 w-8 object-contain bg-white rounded"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-white/20 rounded flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  )}
                  <span className="font-bold">{branding?.name || 'Your Laundry'}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>Services</span>
                  <span>Track Order</span>
                  <span>Contact</span>
                </div>
              </div>
              
              {/* Mock Content */}
              <div className="p-6 bg-gray-50">
                <h2 className="text-xl font-bold mb-2" style={{ color: formData.secondaryColor }}>
                  Welcome to {branding?.name || 'Your Laundry'}
                </h2>
                <p className="text-gray-600 mb-4">Professional laundry services at your doorstep</p>
                <button 
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: formData.accentColor }}
                >
                  Book Now
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

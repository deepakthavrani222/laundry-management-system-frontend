'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Phone, Clock, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthToken = () => {
  const authData = localStorage.getItem('laundry-auth')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      return parsed.state?.token
    } catch (e) {}
  }
  // Also check for direct token storage
  return localStorage.getItem('token')
}

// Geocode address using free Nominatim API
const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
  try {
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      { headers: { 'User-Agent': 'LaundryLobby-Admin/1.0' } }
    )
    const data = await response.json()
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

interface Branch {
  _id: string
  name: string
  code: string
  address: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    landmark?: string
  }
  contact: {
    phone: string
    email?: string
    whatsapp?: string
  }
  coordinates?: {
    latitude: number
    longitude: number
  }
  capacity?: {
    maxOrdersPerDay: number
    maxWeightPerDay: number
    maxCustomersPerDay: number
    staffCount: number
  }
  operatingHours?: {
    openTime: string
    closeTime: string
    workingDays: string[]
  }
  serviceableRadius?: number
  status: string
  isActive: boolean
}

interface EditBranchModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  branch: Branch
}

const WORKING_DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
]

export function EditBranchModal({ isOpen, onClose, onSuccess, branch }: EditBranchModalProps) {
  const [loading, setLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [formData, setFormData] = useState<Branch>(branch)

  useEffect(() => {
    setFormData(branch)
  }, [branch])

  const handleInputChange = (section: string, field: string, value: any) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof Branch] as object || {}),
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  // Auto-geocode from address
  const handleAutoGeocode = async () => {
    const { addressLine1, city, state, pincode } = formData.address
    
    if (!pincode || pincode.length < 6) {
      toast.error('Please enter a valid 6-digit pincode first')
      return
    }
    
    const addressParts = [addressLine1, city, state, pincode, 'India'].filter(Boolean)
    const fullAddress = addressParts.join(', ')
    
    setGeocoding(true)
    try {
      const coords = await geocodeAddress(fullAddress)
      if (coords) {
        setFormData(prev => ({
          ...prev,
          coordinates: {
            latitude: coords.lat,
            longitude: coords.lng
          }
        }))
        toast.success('📍 Coordinates auto-filled!', { duration: 3000 })
      } else {
        // Try with just pincode
        const simpleCoords = await geocodeAddress(`${pincode}, ${city || ''}, India`)
        if (simpleCoords) {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              latitude: simpleCoords.lat,
              longitude: simpleCoords.lng
            }
          }))
          toast.success('📍 Coordinates auto-filled from pincode!', { duration: 3000 })
        } else {
          toast.error('Could not find coordinates. Please enter manually.')
        }
      }
    } catch (error) {
      toast.error('Geocoding failed. Please enter coordinates manually.')
    } finally {
      setGeocoding(false)
    }
  }

  const handleWorkingDaysChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours!,
        workingDays: checked
          ? [...(prev.operatingHours?.workingDays || []), day]
          : (prev.operatingHours?.workingDays || []).filter(d => d !== day)
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = getAuthToken()
      
      // First update branch basic info
      const response = await fetch(`${API_URL}/admin/branches-management/${branch._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // If coordinates are provided, update them separately
        if (formData.coordinates?.latitude && formData.coordinates?.longitude) {
          try {
            await fetch(`${API_URL}/admin/branches/${branch._id}/coordinates`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                latitude: formData.coordinates.latitude,
                longitude: formData.coordinates.longitude,
                serviceableRadius: formData.serviceableRadius || 20
              })
            })
          } catch (coordError) {
            console.warn('Could not update coordinates:', coordError)
          }
        }
        
        toast.success('Branch updated successfully!', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#f0fdf4',
          },
        })
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(`Failed to update branch: ${error.message || 'Unknown error'}`, {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #f87171',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#f87171',
            secondary: '#fef2f2',
          },
        })
      }
    } catch (error) {
      console.error('Error updating branch:', error)
      toast.error('Failed to update branch. Please try again.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #f87171',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#f87171',
          secondary: '#fef2f2',
        },
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Edit Branch</h2>
            <p className="text-sm text-gray-600">{branch.name} ({branch.code})</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Branch Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('', 'name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Branch Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('', 'code', e.target.value.toUpperCase())}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.contact.phone}
                    onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contact.email || ''}
                    onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={formData.contact.whatsapp || ''}
                  onChange={(e) => handleInputChange('contact', 'whatsapp', e.target.value)}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={formData.address.addressLine1}
                    onChange={(e) => handleInputChange('address', 'addressLine1', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={formData.address.addressLine2 || ''}
                    onChange={(e) => handleInputChange('address', 'addressLine2', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.address.pincode}
                      onChange={(e) => handleInputChange('address', 'pincode', e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      value={formData.address.landmark || ''}
                      onChange={(e) => handleInputChange('address', 'landmark', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="serviceableRadius">Serviceable Radius (km)</Label>
                  <Input
                    id="serviceableRadius"
                    type="number"
                    value={formData.serviceableRadius || 20}
                    onChange={(e) => handleInputChange('', 'serviceableRadius', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>

                {/* GPS Coordinates */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      GPS Coordinates
                      {geocoding && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    </Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleAutoGeocode}
                      disabled={geocoding}
                    >
                      {geocoding ? 'Finding...' : '🔄 Auto-detect from Pincode'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Click "Auto-detect" to fill coordinates from pincode, or enter manually.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.coordinates?.latitude || ''}
                        onChange={(e) => handleInputChange('coordinates', 'latitude', parseFloat(e.target.value) || '')}
                        placeholder="26.9124"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.coordinates?.longitude || ''}
                        onChange={(e) => handleInputChange('coordinates', 'longitude', parseFloat(e.target.value) || '')}
                        placeholder="75.7873"
                      />
                    </div>
                  </div>
                  {formData.coordinates?.latitude && formData.coordinates?.longitude ? (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Coordinates set: {formData.coordinates.latitude}, {formData.coordinates.longitude}
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 mt-2">
                      ⚠️ No coordinates - distance calculation won't work in mobile app
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Operations */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operations & Capacity
              </h3>
              
              {/* Operating Hours */}
              <div className="mb-4">
                <Label className="text-base font-medium">Operating Hours</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="openTime">Opening Time</Label>
                    <Input
                      id="openTime"
                      type="time"
                      value={formData.operatingHours?.openTime || '09:00'}
                      onChange={(e) => handleInputChange('operatingHours', 'openTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="closeTime">Closing Time</Label>
                    <Input
                      id="closeTime"
                      type="time"
                      value={formData.operatingHours?.closeTime || '21:00'}
                      onChange={(e) => handleInputChange('operatingHours', 'closeTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Working Days */}
              <div className="mb-4">
                <Label className="text-base font-medium">Working Days</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {WORKING_DAYS.map((day) => (
                    <label key={day.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(formData.operatingHours?.workingDays || []).includes(day.value)}
                        onChange={(e) => handleWorkingDaysChange(day.value, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Capacity */}
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Capacity Settings
                </Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="maxOrdersPerDay">Max Orders/Day</Label>
                    <Input
                      id="maxOrdersPerDay"
                      type="number"
                      value={formData.capacity?.maxOrdersPerDay || 100}
                      onChange={(e) => handleInputChange('capacity', 'maxOrdersPerDay', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxWeightPerDay">Max Weight/Day (kg)</Label>
                    <Input
                      id="maxWeightPerDay"
                      type="number"
                      value={formData.capacity?.maxWeightPerDay || 500}
                      onChange={(e) => handleInputChange('capacity', 'maxWeightPerDay', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxCustomersPerDay">Max Customers/Day</Label>
                    <Input
                      id="maxCustomersPerDay"
                      type="number"
                      value={formData.capacity?.maxCustomersPerDay || 200}
                      onChange={(e) => handleInputChange('capacity', 'maxCustomersPerDay', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staffCount">Staff Count</Label>
                    <Input
                      id="staffCount"
                      type="number"
                      value={formData.capacity?.staffCount || 5}
                      onChange={(e) => handleInputChange('capacity', 'staffCount', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4">
                <Label className="text-base font-medium">Status</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active' && formData.isActive}
                      onChange={(e) => {
                        handleInputChange('', 'status', e.target.value)
                        handleInputChange('', 'isActive', true)
                      }}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="maintenance"
                      checked={formData.status === 'maintenance'}
                      onChange={(e) => {
                        handleInputChange('', 'status', e.target.value)
                        handleInputChange('', 'isActive', true)
                      }}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Maintenance</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive' || !formData.isActive}
                      onChange={(e) => {
                        handleInputChange('', 'status', e.target.value)
                        handleInputChange('', 'isActive', false)
                      }}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Branch'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
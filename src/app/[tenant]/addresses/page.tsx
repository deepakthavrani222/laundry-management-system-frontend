'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  MapPin, Plus, Edit2, Trash2, Star, Phone, Home as HomeIcon, Building, Loader2, Check,
  Sparkles, User, HelpCircle, ShoppingBag, ArrowLeft, LogOut, Menu, X
} from 'lucide-react'
import { useAddresses } from '@/hooks/useAddresses'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface TenantInfo {
  name: string
  slug: string
  tenancyId: string
  branding?: { logo?: { url?: string } }
}

const sidebarNavigation = [
  { name: 'Dashboard', href: 'dashboard', icon: HomeIcon, current: false },
  { name: 'My Orders', href: 'orders', icon: ShoppingBag, current: false },
  { name: 'Support', href: 'support', icon: HelpCircle, current: false },
  { name: 'Addresses', href: 'addresses', icon: MapPin, current: true },
  { name: 'Profile', href: 'profile', icon: User, current: false },
]

export default function TenantAddressesPage() {
  const params = useParams()
  const router = useRouter()
  const tenant = params.tenant as string
  const { user, isAuthenticated, logout } = useAuthStore()
  const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses()
  
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '', phone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', pincode: '', addressType: 'home' as 'home' | 'office', isDefault: false
  })

  useEffect(() => {
    if (!isAuthenticated) router.push(`/${tenant}`)
  }, [isAuthenticated, tenant, router])

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/public/tenancy/branding/${tenant}`)
        const data = await response.json()
        if (data.success) setTenantInfo({ name: data.data.name, slug: data.data.slug, tenancyId: data.data.tenancyId, branding: data.data.branding })
      } catch (error) { console.error('Failed to fetch tenant info:', error) }
    }
    fetchTenantInfo()
  }, [tenant])

  useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, name: user.name || '', phone: user.phone || '' }))
  }, [user])

  const resetForm = () => {
    setFormData({ name: user?.name || '', phone: user?.phone || '', addressLine1: '', addressLine2: '', landmark: '', city: '', pincode: '', addressType: 'home', isDefault: false })
    setEditingAddress(null)
    setShowForm(false)
  }

  const handleEdit = (address: any) => {
    setFormData({ name: address.name, phone: address.phone, addressLine1: address.addressLine1, addressLine2: address.addressLine2 || '', landmark: address.landmark || '', city: address.city, pincode: address.pincode, addressType: address.addressType || 'home', isDefault: address.isDefault })
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingAddress) { await updateAddress(editingAddress._id, formData); toast.success('Address updated') }
      else { await addAddress(formData); toast.success('Address added') }
      resetForm()
    } catch (error) { console.error('Error saving address:', error) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('Delete this address?')) return
    try { await deleteAddress(addressId); toast.success('Address deleted') }
    catch (error) { console.error('Error deleting address:', error) }
  }

  const handleSetDefault = async (addressId: string) => {
    try { await setDefaultAddress(addressId); toast.success('Default address updated') }
    catch (error) { console.error('Error setting default:', error) }
  }

  const handleLogout = () => { logout(); router.push(`/${tenant}`) }

  if (!isAuthenticated) return null


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <Link href={`/${tenant}`} className="flex items-center gap-3">
                {tenantInfo?.branding?.logo?.url ? (
                  <img src={tenantInfo.branding.logo.url} alt={tenantInfo.name} className="w-10 h-10 rounded-xl object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="font-bold text-gray-800">{tenantInfo?.name || 'Addresses'}</h1>
                  <p className="text-xs text-gray-500">Customer Portal</p>
                </div>
              </Link>
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarNavigation.map((item) => (
              <Link key={item.name} href={`/${tenant}/${item.href}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.current ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setSidebarOpen(false)}>
                <item.icon className={`w-5 h-5 ${item.current ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-2">
            <Link href={`/${tenant}`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Back to Store</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">My Addresses</h1>
                <p className="text-sm text-gray-500">Manage your saved addresses</p>
              </div>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Address</span>
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Add/Edit Form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input type="text" value={formData.addressLine1} onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                      placeholder="House/Flat No., Building Name, Street" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                    <input type="text" value={formData.landmark} onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                      placeholder="Near..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input type="text" value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input type="text" value={formData.pincode} onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, addressType: 'home' }))}
                        className={`flex items-center px-4 py-2 rounded-lg border-2 ${formData.addressType === 'home' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200'}`}>
                        <HomeIcon className="w-4 h-4 mr-2" />Home
                      </button>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, addressType: 'office' }))}
                        className={`flex items-center px-4 py-2 rounded-lg border-2 ${formData.addressType === 'office' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200'}`}>
                        <Building className="w-4 h-4 mr-2" />Office
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-600">Set as default address</label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                      {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : (editingAddress ? 'Update' : 'Add Address')}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1">Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses List */}
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
            ) : addresses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No addresses saved</h3>
                <p className="text-gray-600 mb-6">Add your first address to get started</p>
                <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                  <Plus className="w-4 h-4 mr-2" />Add Address
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-800">{address.name}</span>
                          {address.isDefault && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              <Star className="w-3 h-3 mr-1" />Default
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {address.addressType === 'home' ? <><HomeIcon className="w-3 h-3 mr-1" />Home</> : <><Building className="w-3 h-3 mr-1" />Office</>}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-1"><Phone className="w-3 h-3 mr-1" />{address.phone}</div>
                        <p className="text-sm text-gray-600">{address.addressLine1}{address.landmark && ` (${address.landmark})`}</p>
                        <p className="text-sm text-gray-600">{address.city} - {address.pincode}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!address.isDefault && (
                          <Button variant="outline" size="sm" onClick={() => handleSetDefault(address._id)} className="text-xs">
                            <Check className="w-3 h-3 mr-1" />Default
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleEdit(address)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(address._id)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

'use client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { usePermissions } from '@/hooks/usePermissions'
import { Truck, Search, MapPin, Phone, User, Package, CheckCircle, Eye, AlertCircle, Star, Clock, TrendingUp, X, Plus, Edit, Trash2, Power } from 'lucide-react'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 8

interface CoverageArea { pincode: string; area?: string; isActive?: boolean; _id?: string }
interface LogisticsPartner {
  _id: string; companyName: string; contactPerson: { name: string; phone: string; email?: string }
  coverageAreas: CoverageArea[]; isActive: boolean; sla: { pickupTime: number; deliveryTime: number }
  performance: { rating: number; totalDeliveries: number; onTimeRate: number; activeOrders: number }
  rateCard?: { perOrder: number; perKm: number; flatRate: number }; createdAt: string; isGlobal?: boolean
}

const getAuthToken = () => {
  const authData = localStorage.getItem('laundry-auth')
  if (authData) { const parsed = JSON.parse(authData); return parsed.state?.token || parsed.token }
  return null
}

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...options.headers }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'API request failed')
  return data
}

export default function AdminLogisticsPage() {
  const { canCreate, canUpdate, canDelete } = usePermissions('logistics')
  const [partners, setPartners] = useState<LogisticsPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPartner, setSelectedPartner] = useState<LogisticsPartner | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ companyName: '', contactPerson: { name: '', phone: '', email: '' },
    sla: { pickupTime: 2, deliveryTime: 4 }, rateCard: { perOrder: 0, perKm: 0, flatRate: 50 }, coverageAreas: [] as { pincode: string; area: string }[] })
  const [newPincode, setNewPincode] = useState('')

  useEffect(() => { fetchPartners() }, [])
  const fetchPartners = async () => {
    try { setLoading(true); setError(null); const data = await apiCall('/admin/logistics-partners'); setPartners(data.data?.partners || []) }
    catch (err: any) { setError(err.message); setPartners([]) } finally { setLoading(false) }
  }
  const handleCreate = async () => {
    if (!formData.companyName || !formData.contactPerson.name || !formData.contactPerson.phone) { toast.error('Please fill required fields'); return }
    setSaving(true)
    try { await apiCall('/admin/logistics-partners', { method: 'POST', body: JSON.stringify(formData) }); toast.success('Partner created'); setShowCreateModal(false); resetForm(); fetchPartners() }
    catch (err: any) { toast.error(err.message) } finally { setSaving(false) }
  }
  const handleUpdate = async () => {
    if (!selectedPartner) return; setSaving(true)
    try { await apiCall(`/admin/logistics-partners/${selectedPartner._id}`, { method: 'PUT', body: JSON.stringify(formData) }); toast.success('Partner updated'); setShowEditModal(false); fetchPartners() }
    catch (err: any) { toast.error(err.message) } finally { setSaving(false) }
  }
  const handleDelete = async (partner: LogisticsPartner) => {
    if (!confirm(`Delete ${partner.companyName}?`)) return
    try { await apiCall(`/admin/logistics-partners/${partner._id}`, { method: 'DELETE' }); toast.success('Partner deleted'); fetchPartners() } catch (err: any) { toast.error(err.message) }
  }
  const handleToggleStatus = async (partner: LogisticsPartner) => {
    try { await apiCall(`/admin/logistics-partners/${partner._id}/toggle-status`, { method: 'PATCH' }); toast.success(`Partner ${partner.isActive ? 'deactivated' : 'activated'}`); fetchPartners() }
    catch (err: any) { toast.error(err.message) }
  }
  const resetForm = () => { setFormData({ companyName: '', contactPerson: { name: '', phone: '', email: '' }, sla: { pickupTime: 2, deliveryTime: 4 }, rateCard: { perOrder: 0, perKm: 0, flatRate: 50 }, coverageAreas: [] }); setNewPincode('') }
  const openEditModal = (partner: LogisticsPartner) => {
    setSelectedPartner(partner); setFormData({ companyName: partner.companyName, contactPerson: { ...partner.contactPerson }, sla: { ...partner.sla },
      rateCard: partner.rateCard ? { ...partner.rateCard } : { perOrder: 0, perKm: 0, flatRate: 50 }, coverageAreas: partner.coverageAreas.map(a => ({ pincode: a.pincode, area: a.area || '' })) }); setShowEditModal(true)
  }
  const addPincode = () => { if (newPincode && /^\d{6}$/.test(newPincode)) { setFormData(prev => ({ ...prev, coverageAreas: [...prev.coverageAreas, { pincode: newPincode, area: '' }] })); setNewPincode('') } else { toast.error('Enter valid 6-digit pincode') } }
  const removePincode = (index: number) => { setFormData(prev => ({ ...prev, coverageAreas: prev.coverageAreas.filter((_, i) => i !== index) })) }
  const filteredPartners = partners.filter(p => { const matchesSearch = p.companyName.toLowerCase().includes(search.toLowerCase()) || p.contactPerson.name.toLowerCase().includes(search.toLowerCase()); const matchesStatus = !statusFilter || (statusFilter === 'active' && p.isActive) || (statusFilter === 'inactive' && !p.isActive); return matchesSearch && matchesStatus })
  const totalPages = Math.ceil(filteredPartners.length / ITEMS_PER_PAGE)
  const paginatedPartners = filteredPartners.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  useEffect(() => { setCurrentPage(1) }, [search, statusFilter])
  const getRatingColor = (rating: number) => rating >= 4.5 ? 'text-green-600' : rating >= 4.0 ? 'text-yellow-600' : 'text-orange-600'
  if (loading) return <div className="space-y-6 mt-16"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div><div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}</div></div></div>

  return (
    <div className="space-y-6 mt-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-3xl font-bold text-gray-800">Logistics Partners</h1><p className="text-gray-600">Manage delivery and pickup partners</p></div>
        {canCreate && <Button onClick={() => { resetForm(); setShowCreateModal(true) }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Add Partner</Button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"><div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4"><Truck className="w-6 h-6" /></div><p className="text-sm text-blue-100">Total Partners</p><p className="text-3xl font-bold">{partners.length}</p></div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl"><div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4"><CheckCircle className="w-6 h-6" /></div><p className="text-sm text-emerald-100">Active Partners</p><p className="text-3xl font-bold">{partners.filter(p => p.isActive).length}</p></div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl"><div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4"><Package className="w-6 h-6" /></div><p className="text-sm text-purple-100">Active Orders</p><p className="text-3xl font-bold">{partners.reduce((sum, p) => sum + (p.performance?.activeOrders || 0), 0)}</p></div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl"><div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4"><Star className="w-6 h-6" /></div><p className="text-sm text-amber-100">Avg Rating</p><p className="text-3xl font-bold">{(partners.reduce((sum, p) => sum + (p.performance?.rating || 0), 0) / partners.length || 0).toFixed(1)}</p></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative"><Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-3 py-3 border rounded-lg" /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 border rounded-lg"><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b"><h2 className="text-lg font-semibold">Partners ({filteredPartners.length})</h2></div>
        {error && <div className="p-6 bg-red-50 border-b flex items-center"><AlertCircle className="w-5 h-5 text-red-600 mr-2" /><span className="text-red-800">{error}</span></div>}
        <div className="divide-y">
          {filteredPartners.length === 0 ? <div className="p-12 text-center"><Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium mb-2">No Partners Found</h3></div> : paginatedPartners.map((partner) => (
            <div key={partner._id} className="p-6 hover:bg-gray-50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${partner.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-400'}`}><Truck className="w-6 h-6 text-white" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2"><h3 className="text-lg font-semibold">{partner.companyName}</h3><span className={`px-2 py-1 rounded-full text-xs font-medium ${partner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{partner.isActive ? 'Active' : 'Inactive'}</span>{partner.isGlobal && <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Global</span>}<span className={`flex items-center ${getRatingColor(partner.performance.rating)}`}><Star className="w-4 h-4 mr-1 fill-current" />{partner.performance.rating}</span></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600"><div className="flex items-center"><User className="w-4 h-4 mr-1" />{partner.contactPerson.name}</div><div className="flex items-center"><Phone className="w-4 h-4 mr-1" />{partner.contactPerson.phone}</div><div className="flex items-center"><Clock className="w-4 h-4 mr-1" />SLA: {partner.sla.pickupTime}h/{partner.sla.deliveryTime}h</div><div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{partner.coverageAreas.length} areas</div></div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm"><div className="text-blue-600"><Package className="w-4 h-4 inline mr-1" />{partner.performance.totalDeliveries} deliveries</div><div className="text-green-600"><TrendingUp className="w-4 h-4 inline mr-1" />{partner.performance.onTimeRate}% on-time</div><div className="text-gray-500">Rate: ₹{partner.rateCard?.flatRate || 50}/order</div></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedPartner(partner); setShowModal(true) }}><Eye className="w-4 h-4" /></Button>
                  {canUpdate && !partner.isGlobal && <Button variant="outline" size="sm" onClick={() => openEditModal(partner)}><Edit className="w-4 h-4" /></Button>}
                  {canUpdate && !partner.isGlobal && <Button variant="outline" size="sm" onClick={() => handleToggleStatus(partner)} className={partner.isActive ? 'text-orange-600' : 'text-green-600'}><Power className="w-4 h-4" /></Button>}
                  {canDelete && !partner.isGlobal && <Button variant="outline" size="sm" onClick={() => handleDelete(partner)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredPartners.length > ITEMS_PER_PAGE && <Pagination current={currentPage} pages={totalPages} total={filteredPartners.length} limit={ITEMS_PER_PAGE} onPageChange={setCurrentPage} itemName="partners" />}
      </div>

      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-xl font-bold">{showCreateModal ? 'Add New Partner' : 'Edit Partner'}</h2><button onClick={() => { setShowCreateModal(false); setShowEditModal(false) }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-6">
              <div><h3 className="font-semibold mb-3">Company Information</h3><input type="text" value={formData.companyName} onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="Company Name *" /></div>
              <div><h3 className="font-semibold mb-3">Contact Person</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><input type="text" value={formData.contactPerson.name} onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: { ...prev.contactPerson, name: e.target.value } }))} className="px-3 py-2 border rounded-lg" placeholder="Name *" /><input type="text" value={formData.contactPerson.phone} onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: { ...prev.contactPerson, phone: e.target.value } }))} className="px-3 py-2 border rounded-lg" placeholder="Phone *" /><input type="email" value={formData.contactPerson.email} onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: { ...prev.contactPerson, email: e.target.value } }))} className="px-3 py-2 border rounded-lg" placeholder="Email" /></div></div>
              <div><h3 className="font-semibold mb-3">SLA (hours)</h3><div className="grid grid-cols-2 gap-4"><input type="number" value={formData.sla.pickupTime} onChange={(e) => setFormData(prev => ({ ...prev, sla: { ...prev.sla, pickupTime: parseInt(e.target.value) || 2 } }))} className="px-3 py-2 border rounded-lg" placeholder="Pickup Time" min="1" /><input type="number" value={formData.sla.deliveryTime} onChange={(e) => setFormData(prev => ({ ...prev, sla: { ...prev.sla, deliveryTime: parseInt(e.target.value) || 4 } }))} className="px-3 py-2 border rounded-lg" placeholder="Delivery Time" min="1" /></div></div>
              <div><h3 className="font-semibold mb-3">Rate Card (₹)</h3><div className="grid grid-cols-3 gap-4"><input type="number" value={formData.rateCard.flatRate} onChange={(e) => setFormData(prev => ({ ...prev, rateCard: { ...prev.rateCard, flatRate: parseInt(e.target.value) || 0 } }))} className="px-3 py-2 border rounded-lg" placeholder="Flat Rate" min="0" /><input type="number" value={formData.rateCard.perKm} onChange={(e) => setFormData(prev => ({ ...prev, rateCard: { ...prev.rateCard, perKm: parseInt(e.target.value) || 0 } }))} className="px-3 py-2 border rounded-lg" placeholder="Per Km" min="0" /><input type="number" value={formData.rateCard.perOrder} onChange={(e) => setFormData(prev => ({ ...prev, rateCard: { ...prev.rateCard, perOrder: parseInt(e.target.value) || 0 } }))} className="px-3 py-2 border rounded-lg" placeholder="Per Order" min="0" /></div></div>
              <div><h3 className="font-semibold mb-3">Coverage Areas</h3><div className="flex gap-2 mb-3"><input type="text" value={newPincode} onChange={(e) => setNewPincode(e.target.value)} placeholder="6-digit pincode" className="flex-1 px-3 py-2 border rounded-lg" maxLength={6} /><Button type="button" onClick={addPincode} variant="outline"><Plus className="w-4 h-4" /></Button></div><div className="flex flex-wrap gap-2">{formData.coverageAreas.map((area, index) => (<span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">{area.pincode}<button onClick={() => removePincode(index)} className="hover:text-red-600"><X className="w-3 h-3" /></button></span>))}</div></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t"><Button variant="outline" onClick={() => { setShowCreateModal(false); setShowEditModal(false) }}>Cancel</Button><Button onClick={showCreateModal ? handleCreate : handleUpdate} disabled={saving} className="bg-blue-600 hover:bg-blue-700">{saving ? 'Saving...' : showCreateModal ? 'Create' : 'Update'}</Button></div>
          </div>
        </div>
      )}
      {showModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-xl font-bold">{selectedPartner.companyName}</h2><button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="bg-yellow-50 rounded-lg p-4 text-center"><Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" /><p className="text-2xl font-bold text-yellow-600">{selectedPartner.performance.rating}</p><p className="text-xs text-gray-500">Rating</p></div><div className="bg-blue-50 rounded-lg p-4 text-center"><Package className="w-6 h-6 text-blue-500 mx-auto mb-2" /><p className="text-2xl font-bold text-blue-600">{selectedPartner.performance.totalDeliveries}</p><p className="text-xs text-gray-500">Deliveries</p></div><div className="bg-green-50 rounded-lg p-4 text-center"><TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" /><p className="text-2xl font-bold text-green-600">{selectedPartner.performance.onTimeRate}%</p><p className="text-xs text-gray-500">On-Time</p></div><div className="bg-purple-50 rounded-lg p-4 text-center"><Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" /><p className="text-2xl font-bold text-purple-600">{selectedPartner.performance.activeOrders}</p><p className="text-xs text-gray-500">Active</p></div></div>
              <div className="bg-gray-50 rounded-lg p-4"><h3 className="font-semibold mb-2">Contact</h3><p>{selectedPartner.contactPerson.name} | {selectedPartner.contactPerson.phone}</p></div>
              <div className="bg-gray-50 rounded-lg p-4"><h3 className="font-semibold mb-2">SLA</h3><p>Pickup: {selectedPartner.sla.pickupTime}h | Delivery: {selectedPartner.sla.deliveryTime}h</p></div>
              <div><h3 className="font-semibold mb-2">Coverage ({selectedPartner.coverageAreas.length} areas)</h3><div className="flex flex-wrap gap-2">{selectedPartner.coverageAreas.map((area, i) => <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{area.pincode}</span>)}</div></div>
            </div>
            <div className="flex justify-end p-6 border-t"><Button variant="outline" onClick={() => setShowModal(false)}>Close</Button></div>
          </div>
        </div>
      )}
    </div>
  )
}

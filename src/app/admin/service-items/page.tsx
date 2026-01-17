'use client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { Plus, Edit2, Trash2, Loader2, Search, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 8

const SERVICES = [
  { id: 'wash_fold', name: 'Wash & Fold' },
  { id: 'wash_iron', name: 'Wash & Iron' },
  { id: 'dry_clean', name: 'Dry Clean' },
  { id: 'steam_press', name: 'Steam Press' },
  { id: 'starching', name: 'Starching' },
  { id: 'alteration', name: 'Alteration' },
  { id: 'premium_steam_press', name: 'Premium Steam Press' },
  { id: 'premium_dry_clean', name: 'Premium Dry Clean' },
]

const CATEGORIES = [
  { id: 'men', name: 'Men' },
  { id: 'women', name: 'Women' },
  { id: 'kids', name: 'Kids' },
  { id: 'household', name: 'Household' },
  { id: 'institutional', name: 'Institutional' },
  { id: 'others', name: 'Others' },
]

interface ServiceItem {
  _id: string
  name: string
  itemId: string
  service: string
  category: string
  basePrice: number
  description: string
  isActive: boolean
  sortOrder: number
}

export default function ServiceItemsPage() {
  const [items, setItems] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formStep, setFormStep] = useState(1)

  // Multi-service pricing form
  const [formData, setFormData] = useState({
    name: '',
    itemId: '',
    category: 'men',
    isActive: true,
    sortOrder: 0,
    prices: {
      wash_fold: 0,
      wash_iron: 0,
      dry_clean: 0,
      steam_press: 0,
      starching: 0,
      alteration: 0,
      premium_steam_press: 0,
      premium_dry_clean: 0,
    }
  })

  const getToken = () => {
    try {
      const stored = localStorage.getItem('laundry-auth')
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.state?.token || parsed.token
      }
    } catch {
      return null
    }
    return null
  }

  const fetchItems = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch(`${API_URL}/service-items/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setItems(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
      toast.error('Failed to load service items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  // Group items by name and category for display
  const getGroupedItems = () => {
    const grouped: Record<string, { 
      name: string, 
      category: string, 
      itemId: string,
      prices: Record<string, { _id: string, price: number, isActive: boolean }>
    }> = {}
    
    items.forEach(item => {
      const key = `${item.name}_${item.category}`
      if (!grouped[key]) {
        grouped[key] = {
          name: item.name,
          category: item.category,
          itemId: item.itemId.split('_')[0], // base itemId
          prices: {}
        }
      }
      grouped[key].prices[item.service] = {
        _id: item._id,
        price: item.basePrice,
        isActive: item.isActive
      }
    })
    
    return Object.values(grouped)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const token = getToken()
      const itemsToCreate: any[] = []
      
      // Create item for each service that has a price > 0
      const serviceKeys = ['wash_fold', 'wash_iron', 'dry_clean', 'steam_press', 'starching', 'alteration', 'premium_steam_press', 'premium_dry_clean'] as const
      serviceKeys.forEach(service => {
        const price = formData.prices[service]
        if (price > 0) {
          itemsToCreate.push({
            name: formData.name,
            itemId: `${formData.itemId}_${service}`,
            service: service,
            category: formData.category,
            basePrice: price,
            description: '',
            isActive: formData.isActive,
            sortOrder: formData.sortOrder
          })
        }
      })
      
      if (itemsToCreate.length === 0) {
        toast.error('Please enter at least one price')
        setSaving(false)
        return
      }
      
      // Use bulk create
      const response = await fetch(`${API_URL}/service-items/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: itemsToCreate })
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success(`${data.count} items created/updated!`)
        setShowModal(false)
        resetForm()
        fetchItems()
      } else {
        toast.error(data.message || 'Failed to save items')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save items')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGroup = async (name: string, category: string) => {
    if (!confirm(`Delete all prices for "${name}"?`)) return
    
    try {
      const token = getToken()
      const itemsToDelete = items.filter(i => i.name === name && i.category === category)
      
      for (const item of itemsToDelete) {
        await fetch(`${API_URL}/service-items/${item._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      toast.success('Items deleted!')
      fetchItems()
    } catch (error) {
      toast.error('Failed to delete items')
    }
  }

  const openEditModal = (groupedItem: { name: string, category: string, itemId: string, prices: Record<string, { _id: string, price: number, isActive: boolean }> }) => {
    setFormData({
      name: groupedItem.name,
      itemId: groupedItem.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      category: groupedItem.category,
      isActive: true,
      sortOrder: 0,
      prices: {
        wash_fold: groupedItem.prices.wash_fold?.price || 0,
        wash_iron: groupedItem.prices.wash_iron?.price || 0,
        dry_clean: groupedItem.prices.dry_clean?.price || 0,
        steam_press: groupedItem.prices.steam_press?.price || 0,
        starching: groupedItem.prices.starching?.price || 0,
        alteration: groupedItem.prices.alteration?.price || 0,
        premium_steam_press: groupedItem.prices.premium_steam_press?.price || 0,
        premium_dry_clean: groupedItem.prices.premium_dry_clean?.price || 0,
      }
    })
    setFormStep(1)
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      itemId: '',
      category: 'men',
      isActive: true,
      sortOrder: 0,
      prices: { wash_fold: 0, wash_iron: 0, dry_clean: 0, steam_press: 0, starching: 0, alteration: 0, premium_steam_press: 0, premium_dry_clean: 0 }
    })
    setFormStep(1)
  }

  const groupedItems = getGroupedItems()
  const filteredItems = groupedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getCategoryName = (id: string) => CATEGORIES.find(c => c.id === id)?.name || id

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Service Items & Pricing</h1>
          <p className="text-gray-500">Manage items and their prices for different services</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowModal(true) }}
          className="bg-teal-500 hover:bg-teal-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Items Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Wash & Fold</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Wash & Iron</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Dry Clean</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Steam Press</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Starching</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Alteration</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{item.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getCategoryName(item.category)}</td>
                  <td className="px-4 py-3 text-center text-sm">
                    {item.prices.wash_fold?.price ? (
                      <span className="text-gray-800 font-medium">₹{item.prices.wash_fold.price}</span>
                    ) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {item.prices.wash_iron?.price ? (
                      <span className="text-gray-800 font-medium">₹{item.prices.wash_iron.price}</span>
                    ) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {item.prices.dry_clean?.price ? (
                      <span className="text-gray-800 font-medium">₹{item.prices.dry_clean.price}</span>
                    ) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {item.prices.steam_press?.price ? (
                      <span className="text-gray-800 font-medium">₹{item.prices.steam_press.price}</span>
                    ) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {item.prices.starching?.price ? (
                      <span className="text-gray-800 font-medium">₹{item.prices.starching.price}</span>
                    ) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {item.prices.alteration?.price ? (
                      <span className="text-gray-800 font-medium">₹{item.prices.alteration.price}</span>
                    ) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-gray-400 hover:text-teal-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(item.name, item.category)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">No items found</div>
          )}
          
          {/* Pagination */}
          {filteredItems.length > ITEMS_PER_PAGE && (
            <Pagination
              current={currentPage}
              pages={totalPages}
              total={filteredItems.length}
              limit={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              itemName="items"
            />
          )}
        </div>
      )}

      {/* Add Modal */}
      {showModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            {/* Header with Step Indicator */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">{formData.name ? 'Edit Item' : 'Add New Item'}</h2>
                <p className="text-sm text-gray-500">Step {formStep} of 2</p>
              </div>
              <button onClick={() => { setShowModal(false); setFormStep(1) }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2 mb-6">
              <div className={`h-1 flex-1 rounded ${formStep >= 1 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
              <div className={`h-1 flex-1 rounded ${formStep >= 2 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {formStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        name: e.target.value,
                        itemId: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_')
                      }))}
                      placeholder="e.g., Men's Shirt"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowModal(false); setFormStep(1) }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        if (!formData.name.trim()) {
                          toast.error('Please enter item name')
                          return
                        }
                        setFormStep(2)
                      }}
                      className="flex-1 bg-teal-500 hover:bg-teal-600"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Pricing */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prices (₹) - Enter price for each service
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Wash & Fold</label>
                        <input
                          type="number"
                          value={formData.prices.wash_fold || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            prices: { ...prev.prices, wash_fold: Number(e.target.value) }
                          }))}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Wash & Iron</label>
                        <input
                          type="number"
                          value={formData.prices.wash_iron || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            prices: { ...prev.prices, wash_iron: Number(e.target.value) }
                          }))}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Dry Clean</label>
                        <input
                          type="number"
                          value={formData.prices.dry_clean || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            prices: { ...prev.prices, dry_clean: Number(e.target.value) }
                          }))}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Steam Press</label>
                        <input
                          type="number"
                          value={formData.prices.steam_press || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            prices: { ...prev.prices, steam_press: Number(e.target.value) }
                          }))}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Starching</label>
                        <input
                          type="number"
                          value={formData.prices.starching || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            prices: { ...prev.prices, starching: Number(e.target.value) }
                          }))}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Alteration</label>
                        <input
                          type="number"
                          value={formData.prices.alteration || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            prices: { ...prev.prices, alteration: Number(e.target.value) }
                          }))}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Premium Steam Press</label>
                        <input
                          type="number"
                          value={formData.prices.premium_steam_press || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            prices: { ...prev.prices, premium_steam_press: Number(e.target.value) }
                          }))}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Premium Dry Clean</label>
                        <input
                          type="number"
                          value={formData.prices.premium_dry_clean || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            prices: { ...prev.prices, premium_dry_clean: Number(e.target.value) }
                          }))}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="0"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Leave 0 or empty if service not available</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        min="0"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Active</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-teal-500 hover:bg-teal-600"
                    >
                      {saving ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" /> Save Item</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { 
  Package2, 
  Plus, 
  Search, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  Trash2,
  TrendingUp,
  TrendingDown,
  X,
  Save,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthToken = () => {
  try {
    const data = localStorage.getItem('auth-storage')
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.state?.token || parsed.token
    }
  } catch {}
  return localStorage.getItem('token')
}

interface InventoryItem {
  _id: string
  itemName: string
  currentStock: number
  minThreshold: number
  maxCapacity: number
  unit: string
  unitCost?: number
  costPerUnit?: number
  supplier?: { name?: string } | string
  isLowStock: boolean
  isExpired: boolean
}

interface InventoryStats {
  totalItems: number
  lowStockItems: number
  expiredItems: number
  totalValue: number
}

const INVENTORY_ITEMS = ['detergent', 'softener', 'bleach', 'starch', 'chemicals', 'hangers', 'poly_bags', 'tags']

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [newItem, setNewItem] = useState({
    itemName: '', currentStock: 0, minThreshold: 10, maxCapacity: 100, unit: 'units', unitCost: 0, supplier: ''
  })
  const [stockUpdate, setStockUpdate] = useState({ quantity: 0, action: 'add' as 'add' | 'consume', reason: '' })

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const res = await fetch(`${API_URL}/center-admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        setInventory(data.data.inventory || [])
        setStats(data.data.stats)
      }
    } catch (error: any) {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInventory() }, [])

  const handleAddItem = async () => {
    if (!newItem.itemName) { toast.error('Select an item'); return }
    try {
      setSaving(true)
      const token = getAuthToken()
      const res = await fetch(`${API_URL}/center-admin/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(newItem)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Item added')
        setShowAddModal(false)
        setNewItem({ itemName: '', currentStock: 0, minThreshold: 10, maxCapacity: 100, unit: 'units', unitCost: 0, supplier: '' })
        fetchInventory()
      } else {
        toast.error(data.message)
      }
    } catch { toast.error('Failed to add item') }
    finally { setSaving(false) }
  }

  const handleUpdateStock = async () => {
    if (!selectedItem || stockUpdate.quantity <= 0) { toast.error('Enter valid quantity'); return }
    try {
      setSaving(true)
      const token = getAuthToken()
      const res = await fetch(`${API_URL}/center-admin/inventory/${selectedItem._id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(stockUpdate)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Stock updated')
        setShowStockModal(false)
        setSelectedItem(null)
        fetchInventory()
      } else {
        toast.error(data.message)
      }
    } catch { toast.error('Failed to update stock') }
    finally { setSaving(false) }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'low' && item.isLowStock) || (filter === 'expired' && item.isExpired)
    return matchesSearch && matchesFilter
  })

  const getStockPercentage = (item: InventoryItem) => Math.min(100, Math.round((item.currentStock / item.maxCapacity) * 100))
  const getStockColor = (item: InventoryItem) => {
    if (item.isExpired) return 'bg-red-500'
    if (item.isLowStock) return 'bg-orange-500'
    const pct = getStockPercentage(item)
    return pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-orange-500'
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage branch supplies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchInventory}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-500 hover:bg-blue-600"><Plus className="w-4 h-4 mr-2" />Add Item</Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.totalItems}</div>
            <div className="text-sm text-blue-100">Total Items</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.lowStockItems}</div>
            <div className="text-sm text-orange-100">Low Stock</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.expiredItems}</div>
            <div className="text-sm text-red-100">Expired</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">₹{stats.totalValue.toLocaleString()}</div>
            <div className="text-sm text-green-100">Total Value</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Items</option>
            <option value="low">Low Stock</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {filteredInventory.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No inventory items</h3>
          <Button onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.map((item) => (
            <div key={item._id} className={`bg-white rounded-xl shadow-sm border p-4 ${item.isExpired ? 'border-red-300 bg-red-50' : item.isLowStock ? 'border-orange-300 bg-orange-50' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 capitalize">{item.itemName.replace('_', ' ')}</h3>
                  <p className="text-sm text-gray-500">{item.unit}</p>
                </div>
                {item.isLowStock && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Low</span>}
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Stock Level</span>
                  <span className="font-medium">{item.currentStock} / {item.maxCapacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${getStockColor(item)}`} style={{ width: `${getStockPercentage(item)}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-green-600" onClick={() => { setSelectedItem(item); setStockUpdate({ quantity: 0, action: 'add', reason: '' }); setShowStockModal(true) }}>
                  <TrendingUp className="w-3 h-3 mr-1" />Restock
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-orange-600" onClick={() => { setSelectedItem(item); setStockUpdate({ quantity: 0, action: 'consume', reason: '' }); setShowStockModal(true) }}>
                  <TrendingDown className="w-3 h-3 mr-1" />Use
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Inventory Item</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <select value={newItem.itemName} onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select item</option>
                {INVENTORY_ITEMS.map(item => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Current Stock" value={newItem.currentStock} onChange={(e) => setNewItem({ ...newItem, currentStock: parseInt(e.target.value) || 0 })} className="px-3 py-2 border rounded-lg" />
                <select value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="px-3 py-2 border rounded-lg">
                  <option value="units">Units</option>
                  <option value="liters">Liters</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleAddItem} disabled={saving} className="flex-1 bg-blue-500">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Add</Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {showStockModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">{stockUpdate.action === 'add' ? 'Restock' : 'Use Stock'}</h3>
              <button onClick={() => setShowStockModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="font-medium capitalize">{selectedItem.itemName.replace('_', ' ')}</div>
              <div className="text-sm text-gray-500">Current: {selectedItem.currentStock} {selectedItem.unit}</div>
            </div>
            <input type="number" min="1" placeholder="Quantity" value={stockUpdate.quantity} onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg mb-4" />
            <div className="flex gap-3">
              <Button onClick={handleUpdateStock} disabled={saving} className={`flex-1 ${stockUpdate.action === 'add' ? 'bg-green-500' : 'bg-orange-500'}`}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : stockUpdate.action === 'add' ? 'Add Stock' : 'Use Stock'}
              </Button>
              <Button variant="outline" onClick={() => setShowStockModal(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

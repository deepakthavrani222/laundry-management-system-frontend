'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

// Center Admin specific modules - branch/center level operations
const CENTER_ADMIN_MODULES = [
  { key: 'orders', label: 'Orders', icon: '📦' },
  { key: 'staff', label: 'Staff Management', icon: '👥' },
  { key: 'inventory', label: 'Inventory', icon: '📦' },
  { key: 'services', label: 'Services', icon: '🧺' },
  { key: 'customers', label: 'Customers', icon: '👤' },
  { key: 'logistics', label: 'Logistics', icon: '🚚' },
  { key: 'tickets', label: 'Support Tickets', icon: '🎫' },
  { key: 'performance', label: 'Performance', icon: '📊' },
  { key: 'settings', label: 'Branch Settings', icon: '⚙️' }
]

const COMMON_ACTIONS = ['view', 'create', 'update', 'delete']

const CENTER_ADMIN_ADVANCED_ACTIONS: Record<string, string[]> = {
  orders: ['assign', 'cancel', 'process'],
  staff: ['assignShift', 'manageAttendance'],
  inventory: ['restock', 'writeOff'],
  services: ['updatePricing'],
  logistics: ['assign', 'track'],
  tickets: ['assign', 'resolve', 'escalate'],
  performance: ['export']
}

const ACTION_LABELS: Record<string, string> = {
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  assign: 'Assign',
  cancel: 'Cancel',
  process: 'Process',
  assignShift: 'Assign Shift',
  manageAttendance: 'Manage Attendance',
  restock: 'Restock',
  writeOff: 'Write Off',
  updatePricing: 'Update Pricing',
  resolve: 'Resolve',
  escalate: 'Escalate',
  export: 'Export'
}

interface Permissions {
  [module: string]: {
    [action: string]: boolean
  }
}

interface CenterAdminPermissionMatrixProps {
  permissions: Permissions
  onChange: (permissions: Permissions) => void
  disabled?: boolean
  compact?: boolean
}

export function CenterAdminPermissionMatrix({ 
  permissions, 
  onChange, 
  disabled = false,
  compact = false
}: CenterAdminPermissionMatrixProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(
    compact ? [] : CENTER_ADMIN_MODULES.map(m => m.key)
  )

  const getModuleActions = (moduleKey: string) => {
    const actions = [...COMMON_ACTIONS]
    if (CENTER_ADMIN_ADVANCED_ACTIONS[moduleKey]) {
      actions.push(...CENTER_ADMIN_ADVANCED_ACTIONS[moduleKey])
    }
    return actions
  }

  const toggleModule = (moduleKey: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleKey) 
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    )
  }

  const handlePermissionChange = (module: string, action: string, value: boolean) => {
    if (disabled) return

    const newPermissions = {
      ...permissions,
      [module]: {
        ...permissions[module],
        [action]: value
      }
    }
    onChange(newPermissions)
  }

  const toggleAllModulePermissions = (moduleKey: string, enable: boolean) => {
    if (disabled) return
    
    const actions = getModuleActions(moduleKey)
    const newModulePerms: Record<string, boolean> = {}
    
    actions.forEach(action => {
      newModulePerms[action] = enable
    })

    onChange({
      ...permissions,
      [moduleKey]: newModulePerms
    })
  }

  const getModulePermissionCount = (moduleKey: string) => {
    const actions = getModuleActions(moduleKey)
    const enabled = actions.filter(a => permissions[moduleKey]?.[a]).length
    return { enabled, total: actions.length }
  }

  return (
    <div className="space-y-2">
      {CENTER_ADMIN_MODULES.map(module => {
        const isExpanded = expandedModules.includes(module.key)
        const { enabled, total } = getModulePermissionCount(module.key)
        const actions = getModuleActions(module.key)
        
        return (
          <div key={module.key} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Module Header */}
            <div 
              className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${
                enabled > 0 ? 'bg-green-50' : 'bg-white'
              }`}
              onClick={() => toggleModule(module.key)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{module.icon}</span>
                <span className="font-medium text-gray-800">{module.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  enabled === total 
                    ? 'bg-green-100 text-green-700' 
                    : enabled > 0 
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {enabled}/{total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!disabled && (
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggleAllModulePermissions(module.key, true)}
                      className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllModulePermissions(module.key, false)}
                      className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      None
                    </button>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Permissions Grid */}
            {isExpanded && (
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {actions.map(action => {
                    const isChecked = permissions[module.key]?.[action] || false
                    const isAdvanced = CENTER_ADMIN_ADVANCED_ACTIONS[module.key]?.includes(action)
                    
                    return (
                      <label
                        key={action}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          disabled 
                            ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                            : isChecked 
                              ? 'bg-green-100 border border-green-300' 
                              : 'bg-white border border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handlePermissionChange(module.key, action, e.target.checked)}
                          disabled={disabled}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                          isChecked 
                            ? 'bg-green-600 border-green-600' 
                            : 'border-gray-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm ${isAdvanced ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                          {ACTION_LABELS[action] || action}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Default permissions for Center Admin
export const getDefaultCenterAdminPermissions = () => ({
  orders: { view: false, create: false, update: false, delete: false, assign: false, cancel: false, process: false },
  staff: { view: false, create: false, update: false, delete: false, assignShift: false, manageAttendance: false },
  inventory: { view: false, create: false, update: false, delete: false, restock: false, writeOff: false },
  services: { view: false, create: false, update: false, delete: false, updatePricing: false },
  customers: { view: false, create: false, update: false, delete: false },
  logistics: { view: false, create: false, update: false, delete: false, assign: false, track: false },
  tickets: { view: false, create: false, update: false, delete: false, assign: false, resolve: false, escalate: false },
  performance: { view: false, create: false, update: false, delete: false, export: false },
  settings: { view: false, create: false, update: false, delete: false }
})

// Preset for full Center Admin access
export const getFullCenterAdminPermissions = () => ({
  orders: { view: true, create: true, update: true, delete: false, assign: true, cancel: true, process: true },
  staff: { view: true, create: true, update: true, delete: true, assignShift: true, manageAttendance: true },
  inventory: { view: true, create: true, update: true, delete: true, restock: true, writeOff: true },
  services: { view: true, create: false, update: true, delete: false, updatePricing: false },
  customers: { view: true, create: false, update: true, delete: false },
  logistics: { view: true, create: true, update: true, delete: false, assign: true, track: true },
  tickets: { view: true, create: true, update: true, delete: false, assign: true, resolve: true, escalate: true },
  performance: { view: true, create: false, update: false, delete: false, export: true },
  settings: { view: true, create: false, update: true, delete: false }
})

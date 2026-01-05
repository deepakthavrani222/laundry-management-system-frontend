'use client';

import { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, X, Search, Package, User, MapPin, Clock, IndianRupee, CheckCircle, AlertCircle, Tag, Printer } from 'lucide-react';

interface OrderScanResult {
  scanType: 'order';
  orderId: string;
  orderNumber: string;
  barcode: string;
  status: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  branch: {
    name: string;
    code: string;
  } | null;
  items: Array<{
    itemId: string;
    tagCode: string;
    itemType: string;
    service: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specialInstructions?: string;
    processingStatus: string;
  }>;
  pricing: {
    subtotal: number;
    expressCharge: number;
    deliveryCharge: number;
    discount: number;
    tax: number;
    total: number;
  };
  pickupDate: string;
  pickupTimeSlot: string;
  estimatedDeliveryDate: string;
  pickupAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    city: string;
    pincode: string;
  };
  isExpress: boolean;
  isVIPOrder: boolean;
  paymentMethod: string;
  paymentStatus: string;
  specialInstructions?: string;
}

interface ItemScanResult {
  scanType: 'item';
  itemId: string;
  tagCode: string;
  itemType: string;
  service: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  processingStatus: string;
  qualityCheck?: {
    passed: boolean;
    notes: string;
    checkedAt: string;
  };
  issues: Array<{
    type: string;
    description: string;
    reportedAt: string;
    resolved: boolean;
  }>;
  order: {
    orderId: string;
    orderNumber: string;
    barcode: string;
    status: string;
    isExpress: boolean;
    isVIPOrder: boolean;
    totalItems: number;
    pickupDate: string;
    estimatedDeliveryDate: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  branch: {
    name: string;
    code: string;
  } | null;
}

type ScanResult = OrderScanResult | ItemScanResult;

interface BarcodeScannerProps {
  onScanResult?: (result: ScanResult) => void;
  onPrintTags?: (orderId: string, orderNumber: string) => void;
  apiBaseUrl?: string;
}

export default function BarcodeScanner({ onScanResult, onPrintTags, apiBaseUrl = '' }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleScan = async (code: string) => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/barcode/scan/${code.trim()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Check if it's an item or order scan
        const result = data.data.item || data.data.order;
        setScanResult(result);
        if (onScanResult) {
          onScanResult(result);
        }
      } else {
        setError(data.message || 'Not found');
        setScanResult(null);
      }
    } catch (err) {
      setError('Failed to scan. Please try again.');
      setScanResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan(manualCode);
    }
  };

  const handleUpdateItemStatus = async (tagCode: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/barcode/scan-item/${tagCode}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ processingStatus: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh the scan result
        handleScan(tagCode);
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'placed': 'bg-blue-100 text-blue-800',
      'assigned_to_branch': 'bg-purple-100 text-purple-800',
      'picked_up': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-orange-100 text-orange-800',
      'ready_for_delivery': 'bg-teal-100 text-teal-800',
      'out_for_delivery': 'bg-cyan-100 text-cyan-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      // Item processing statuses
      'pending': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'quality_check': 'bg-purple-100 text-purple-800',
      'ready': 'bg-teal-100 text-teal-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderItemResult = (result: ItemScanResult) => (
    <div className="space-y-4">
      {/* Item Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-purple-500" />
          <span className="text-sm text-purple-600 font-medium">Item Tag Scanned</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Tag Code</p>
            <p className="text-xl font-bold font-mono text-gray-900">{result.tagCode}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(result.processingStatus)}`}>
            {result.processingStatus.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Order: <strong>{result.order.orderNumber}</strong></span>
          {result.order.isExpress && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">⚡ Express</span>
          )}
          {result.order.isVIPOrder && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">👑 VIP</span>
          )}
        </div>
      </div>

      {/* Item Details */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-teal-500" />
          <h3 className="font-semibold text-gray-900">Item Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Item Type</p>
            <p className="font-medium">{result.itemType}</p>
          </div>
          <div>
            <p className="text-gray-500">Service</p>
            <p className="font-medium">{result.service}</p>
          </div>
          <div>
            <p className="text-gray-500">Category</p>
            <p className="font-medium">{result.category}</p>
          </div>
          <div>
            <p className="text-gray-500">Quantity</p>
            <p className="font-medium">{result.quantity}</p>
          </div>
          <div>
            <p className="text-gray-500">Unit Price</p>
            <p className="font-medium">₹{result.unitPrice}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Price</p>
            <p className="font-medium text-green-600">₹{result.totalPrice}</p>
          </div>
        </div>
        {result.specialInstructions && (
          <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">📝 {result.specialInstructions}</p>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-teal-500" />
          <h3 className="font-semibold text-gray-900">Customer</h3>
        </div>
        <div className="text-sm">
          <p className="font-medium">{result.customer.name}</p>
          <p className="text-gray-600">{result.customer.phone}</p>
          <p className="text-gray-500">{result.customer.email}</p>
        </div>
      </div>

      {/* Quality Check */}
      {result.qualityCheck && (
        <div className={`p-4 rounded-xl ${result.qualityCheck.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className={`w-5 h-5 ${result.qualityCheck.passed ? 'text-green-500' : 'text-red-500'}`} />
            <h3 className="font-semibold">Quality Check: {result.qualityCheck.passed ? 'Passed' : 'Failed'}</h3>
          </div>
          {result.qualityCheck.notes && (
            <p className="text-sm text-gray-600">{result.qualityCheck.notes}</p>
          )}
        </div>
      )}

      {/* Issues */}
      {result.issues && result.issues.length > 0 && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-red-800">Issues ({result.issues.length})</h3>
          </div>
          <div className="space-y-2">
            {result.issues.map((issue, idx) => (
              <div key={idx} className="bg-white p-2 rounded-lg text-sm">
                <p className="font-medium capitalize">{issue.type.replace(/_/g, ' ')}</p>
                <p className="text-gray-600">{issue.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(issue.reportedAt)} • {issue.resolved ? '✅ Resolved' : '⏳ Pending'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Status */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-3">Update Processing Status</h3>
        <div className="flex flex-wrap gap-2">
          {['pending', 'in_progress', 'completed', 'quality_check', 'ready'].map((status) => (
            <button
              key={status}
              onClick={() => handleUpdateItemStatus(result.tagCode, status)}
              disabled={result.processingStatus === status}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                result.processingStatus === status
                  ? 'bg-teal-500 text-white'
                  : 'bg-white border hover:bg-gray-100'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrderResult = (result: OrderScanResult) => (
    <div className="space-y-4">
      {/* Order Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-xl font-bold text-gray-900">{result.orderNumber}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(result.status)}`}>
            {result.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-mono bg-white px-2 py-1 rounded border">
            {result.barcode}
          </span>
          {result.isExpress && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">⚡ Express</span>
          )}
          {result.isVIPOrder && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">👑 VIP</span>
          )}
        </div>
      </div>

      {/* Print Tags Button */}
      {onPrintTags && (
        <button
          onClick={() => onPrintTags(result.orderId, result.orderNumber)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          <Printer className="w-5 h-5" />
          Print Item Tags ({result.items.length} items)
        </button>
      )}

      {/* Customer Info */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-teal-500" />
          <h3 className="font-semibold text-gray-900">Customer Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium">{result.customer.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium">{result.customer.phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{result.customer.email}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-teal-500" />
          <h3 className="font-semibold text-gray-900">Order Items ({result.items.length})</h3>
        </div>
        <div className="space-y-2">
          {result.items.map((item, index) => (
            <div key={index} className="bg-white p-3 rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{item.itemType}</p>
                    {item.tagCode && (
                      <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                        {item.tagCode}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{item.service} • {item.category}</p>
                  {item.specialInstructions && (
                    <p className="text-xs text-orange-600 mt-1">📝 {item.specialInstructions}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{item.totalPrice}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.processingStatus)}`}>
                    {item.processingStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pickup Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-teal-500" />
            <h3 className="font-semibold text-gray-900">Schedule</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">Pickup</p>
              <p className="font-medium">{formatDate(result.pickupDate)}</p>
              <p className="text-gray-600">{result.pickupTimeSlot}</p>
            </div>
            <div>
              <p className="text-gray-500">Est. Delivery</p>
              <p className="font-medium">{formatDate(result.estimatedDeliveryDate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-teal-500" />
            <h3 className="font-semibold text-gray-900">Pickup Address</h3>
          </div>
          <div className="text-sm">
            <p className="font-medium">{result.pickupAddress.name}</p>
            <p className="text-gray-600">{result.pickupAddress.addressLine1}</p>
            <p className="text-gray-600">{result.pickupAddress.city} - {result.pickupAddress.pincode}</p>
            <p className="text-gray-500">📞 {result.pickupAddress.phone}</p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <IndianRupee className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Payment Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>₹{result.pricing.subtotal}</span>
          </div>
          {result.pricing.expressCharge > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Express</span>
              <span>₹{result.pricing.expressCharge}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery</span>
            <span>₹{result.pricing.deliveryCharge}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tax</span>
            <span>₹{result.pricing.tax}</span>
          </div>
          <div className="col-span-2 flex justify-between pt-2 border-t border-green-200 font-bold text-lg">
            <span>Total</span>
            <span className="text-green-600">₹{result.pricing.total}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="bg-white px-2 py-1 rounded capitalize">{result.paymentMethod}</span>
          <span className={`px-2 py-1 rounded ${result.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {result.paymentStatus}
          </span>
        </div>
      </div>

      {/* Special Instructions */}
      {result.specialInstructions && (
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
          <p className="text-sm font-medium text-yellow-800">📝 Special Instructions</p>
          <p className="text-yellow-700 mt-1">{result.specialInstructions}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md"
      >
        <QrCode className="w-5 h-5" />
        <span>Scan Barcode</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QrCode className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">Barcode Scanner</h2>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setScanResult(null);
                  setError(null);
                  setManualCode('');
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Manual Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Barcode or Order Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
                      placeholder="LP1234567890 or ORD..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg font-mono"
                      autoFocus
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <button
                    onClick={() => handleScan(manualCode)}
                    disabled={isLoading || !manualCode.trim()}
                    className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Scanning...' : 'Scan'}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Scan Result */}
              {scanResult && (
                scanResult.scanType === 'item' 
                  ? renderItemResult(scanResult as ItemScanResult)
                  : renderOrderResult(scanResult as OrderScanResult)
              )}

              {/* Empty State */}
              {!scanResult && !error && !isLoading && (
                <div className="text-center py-12">
                  <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Enter a barcode or order number to view order details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

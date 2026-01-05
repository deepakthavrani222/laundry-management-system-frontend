'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  QrCode, Search, Package, User, MapPin, Clock, IndianRupee, 
  CheckCircle, AlertCircle, RefreshCw, History, Truck, 
  ArrowRight, Tag
} from 'lucide-react';
import { barcodeAPI } from '@/lib/api';
import OrderQRCode from '@/components/OrderQRCode';
import toast from 'react-hot-toast';

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

const ORDER_STATUSES = [
  { value: 'placed', label: 'Placed', color: 'blue' },
  { value: 'assigned_to_branch', label: 'Assigned to Branch', color: 'purple' },
  { value: 'picked_up', label: 'Picked Up', color: 'yellow' },
  { value: 'processing', label: 'Processing', color: 'orange' },
  { value: 'ready_for_delivery', label: 'Ready for Delivery', color: 'teal' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'cyan' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];


const ITEM_STATUSES = ['pending', 'in_progress', 'completed', 'quality_check', 'ready'];

export default function AdminScannerPage() {
  const [manualCode, setManualCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{ code: string; type: string; time: Date }>>([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleScan = async (code: string) => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await barcodeAPI.scanBarcode(code.trim());
      
      if (response.data.success) {
        const result = response.data.data.order || response.data.data.item;
        setScanResult(result);
        
        if (result.scanType === 'order') {
          setSelectedStatus(result.status);
        } else {
          setSelectedStatus(result.processingStatus);
        }
        
        setScanHistory(prev => [
          { code: result.barcode || result.tagCode, type: result.scanType, time: new Date() },
          ...prev.slice(0, 9)
        ]);
        
        toast.success(`${result.scanType === 'order' ? 'Order' : 'Item'} found!`);
      } else {
        setError(response.data.message || 'Not found');
        setScanResult(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to scan');
      setScanResult(null);
    } finally {
      setIsLoading(false);
      setManualCode('');
      inputRef.current?.focus();
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan(manualCode);
    }
  };

  const handleOrderStatusUpdate = async () => {
    if (!scanResult || scanResult.scanType !== 'order' || !selectedStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      await barcodeAPI.updateStatusViaScan(scanResult.barcode, selectedStatus, statusNotes);
      setScanResult(prev => prev && prev.scanType === 'order' ? { ...prev, status: selectedStatus } : prev);
      setStatusNotes('');
      toast.success('Order status updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleItemStatusUpdate = async (newStatus: string) => {
    if (!scanResult || scanResult.scanType !== 'item') return;
    
    setIsUpdatingStatus(true);
    try {
      await barcodeAPI.updateItemStatus(scanResult.tagCode, newStatus);
      setScanResult(prev => prev && prev.scanType === 'item' ? { ...prev, processingStatus: newStatus } : prev);
      setSelectedStatus(newStatus);
      toast.success('Item status updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'placed': 'bg-blue-100 text-blue-800 border-blue-200',
      'assigned_to_branch': 'bg-purple-100 text-purple-800 border-purple-200',
      'picked_up': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'processing': 'bg-orange-100 text-orange-800 border-orange-200',
      'ready_for_delivery': 'bg-teal-100 text-teal-800 border-teal-200',
      'out_for_delivery': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'pending': 'bg-gray-100 text-gray-800 border-gray-200',
      'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'quality_check': 'bg-purple-100 text-purple-800 border-purple-200',
      'ready': 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };


  const renderItemResult = (result: ItemScanResult) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5" />
          <span className="text-purple-100 text-sm">Item Tag Scanned</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">Tag Code</p>
            <p className="text-2xl font-bold font-mono">{result.tagCode}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${getStatusColor(result.processingStatus)}`}>
            {result.processingStatus.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-4 text-sm">
          <span>Order: <strong>{result.order.orderNumber}</strong></span>
          {result.order.isExpress && <span className="bg-orange-400 px-2 py-1 rounded">⚡ Express</span>}
          {result.order.isVIPOrder && <span className="bg-purple-400 px-2 py-1 rounded">👑 VIP</span>}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">Item Details</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-gray-500">Type</p><p className="font-medium">{result.itemType}</p></div>
            <div><p className="text-gray-500">Service</p><p className="font-medium">{result.service}</p></div>
            <div><p className="text-gray-500">Category</p><p className="font-medium">{result.category}</p></div>
            <div><p className="text-gray-500">Quantity</p><p className="font-medium">{result.quantity}</p></div>
            <div><p className="text-gray-500">Unit Price</p><p className="font-medium">₹{result.unitPrice}</p></div>
            <div><p className="text-gray-500">Total</p><p className="font-medium text-green-600">₹{result.totalPrice}</p></div>
          </div>
          {result.specialInstructions && (
            <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-sm text-yellow-800">📝 {result.specialInstructions}</div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">Customer</h3>
          </div>
          <div className="text-sm">
            <p className="font-medium">{result.customer.name}</p>
            <p className="text-gray-600">{result.customer.phone}</p>
            <p className="text-gray-500">{result.customer.email}</p>
          </div>
        </div>

        {result.qualityCheck && (
          <div className={`p-4 rounded-xl ${result.qualityCheck.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className={`w-5 h-5 ${result.qualityCheck.passed ? 'text-green-500' : 'text-red-500'}`} />
              <h3 className="font-semibold">Quality Check: {result.qualityCheck.passed ? 'Passed' : 'Failed'}</h3>
            </div>
            {result.qualityCheck.notes && <p className="text-sm text-gray-600">{result.qualityCheck.notes}</p>}
          </div>
        )}

        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <h3 className="font-semibold text-gray-900 mb-3">Update Processing Status</h3>
          <div className="flex flex-wrap gap-2">
            {ITEM_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleItemStatusUpdate(status)}
                disabled={isUpdatingStatus || result.processingStatus === status}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                  result.processingStatus === status
                    ? 'bg-purple-500 text-white'
                    : 'bg-white border hover:bg-gray-100'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );


  const renderOrderResult = (result: OrderScanResult) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Order Number</p>
            <p className="text-2xl font-bold">{result.orderNumber}</p>
          </div>
          <OrderQRCode 
            orderNumber={result.orderNumber}
            orderId={result.orderId}
            barcode={result.barcode}
            size="small"
            showDownload={true}
            showPrint={true}
          />
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${getStatusColor(result.status)}`}>
            {result.status.replace(/_/g, ' ')}
          </span>
          {result.isExpress && <span className="bg-orange-400 px-3 py-1 rounded-full text-sm">⚡ Express</span>}
          {result.isVIPOrder && <span className="bg-purple-400 px-3 py-1 rounded-full text-sm">👑 VIP</span>}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Customer Details</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-gray-500">Name</p><p className="font-medium text-lg">{result.customer.name}</p></div>
            <div><p className="text-gray-500">Phone</p><p className="font-medium text-lg">{result.customer.phone}</p></div>
            <div><p className="text-gray-500">Email</p><p className="font-medium">{result.customer.email}</p></div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Order Items ({result.items.length})</h3>
          </div>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Item</th>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Tag</th>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Service</th>
                  <th className="text-center px-4 py-2 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-2 text-sm font-medium text-gray-600">Price</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.itemType}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      {item.tagCode && (
                        <button 
                          onClick={() => handleScan(item.tagCode)}
                          className="text-xs font-mono bg-gray-100 px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-600"
                        >
                          {item.tagCode}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.service}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.processingStatus)}`}>
                        {item.processingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">₹{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Schedule</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Pickup</span><span className="font-medium">{result.pickupDate ? formatDate(result.pickupDate) : 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time Slot</span><span className="font-medium">{result.pickupTimeSlot || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Est. Delivery</span><span className="font-medium">{result.estimatedDeliveryDate ? formatDate(result.estimatedDeliveryDate) : 'N/A'}</span></div>
            </div>
          </div>
          {result.pickupAddress && (
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Pickup Address</h3>
            </div>
            <div className="text-sm">
              <p className="font-medium">{result.pickupAddress.name || 'N/A'}</p>
              <p className="text-gray-600">{result.pickupAddress.addressLine1 || ''}</p>
              <p className="text-gray-600">{result.pickupAddress.city || ''} {result.pickupAddress.pincode ? `- ${result.pickupAddress.pincode}` : ''}</p>
              {result.pickupAddress.phone && <p className="text-blue-600 mt-1">📞 {result.pickupAddress.phone}</p>}
            </div>
          </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <IndianRupee className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Payment Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{result.pricing?.subtotal || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>₹{result.pricing?.deliveryCharge || 0}</span></div>
            {(result.pricing?.expressCharge || 0) > 0 && <div className="flex justify-between"><span className="text-gray-500">Express</span><span>₹{result.pricing?.expressCharge}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>₹{result.pricing?.tax || 0}</span></div>
          </div>
          <div className="flex justify-between pt-3 mt-3 border-t border-green-200 font-bold text-xl">
            <span>Total</span><span className="text-green-600">₹{result.pricing?.total || 0}</span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="bg-white px-3 py-1 rounded-lg capitalize border">{result.paymentMethod || 'N/A'}</span>
            <span className={`px-3 py-1 rounded-lg ${result.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{result.paymentStatus || 'pending'}</span>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Update Order Status</h3>
          </div>
          <div className="flex gap-3">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              {ORDER_STATUSES.map(status => (<option key={status.value} value={status.value}>{status.label}</option>))}
            </select>
            <button onClick={handleOrderStatusUpdate} disabled={isUpdatingStatus || selectedStatus === result.status} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
              {isUpdatingStatus ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Update <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
          <input type="text" value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} placeholder="Add notes (optional)" className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
    </div>
  );


  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <QrCode className="w-8 h-8 text-blue-500" />
          Barcode Scanner
        </h1>
        <p className="text-gray-500 mt-1">Scan order barcodes or item tags to view details and update status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Scan or Enter Barcode / Order Number / Item Tag</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input ref={inputRef} type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value.toUpperCase())} onKeyPress={handleKeyPress} placeholder="LP1234567890, ORD..., or IT..." className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl font-mono transition-all" autoFocus />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>
              <button onClick={() => handleScan(manualCode)} disabled={isLoading || !manualCode.trim()} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 transition-all font-semibold text-lg shadow-lg">
                {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : 'Scan'}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">💡 Supports order barcodes (LP...) and item tags (IT...)</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {scanResult && (scanResult.scanType === 'item' ? renderItemResult(scanResult as ItemScanResult) : renderOrderResult(scanResult as OrderScanResult))}

          {!scanResult && !error && !isLoading && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <QrCode className="w-20 h-20 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Ready to Scan</h3>
              <p className="text-gray-400">Enter a barcode or item tag to view details</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Recent Scans</h3>
            </div>
            {scanHistory.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No scans yet</p>
            ) : (
              <div className="space-y-2">
                {scanHistory.map((scan, index) => (
                  <button key={index} onClick={() => handleScan(scan.code)} className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors">
                    <div className="flex items-center gap-2">
                      {scan.type === 'item' ? <Tag className="w-4 h-4 text-purple-500" /> : <Package className="w-4 h-4 text-blue-500" />}
                      <p className="font-mono text-sm text-blue-600">{scan.code}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(scan.time)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-semibold mb-4">Today's Scans</h3>
            <div className="text-4xl font-bold">{scanHistory.length}</div>
            <p className="text-blue-100 text-sm mt-1">items scanned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
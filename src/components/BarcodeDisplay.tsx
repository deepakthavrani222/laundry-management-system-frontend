'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Printer, Loader2, Package, Clock, CheckCircle, Truck, IndianRupee } from 'lucide-react';
import { formatOrderNumber } from '@/utils/orderUtils';

interface OrderDetails {
  orderNumber: string;
  status: string;
  items?: Array<{
    itemType: string;
    service: string;
    quantity: number;
    totalPrice: number;
  }>;
  pricing?: {
    subtotal: number;
    total: number;
  };
  pickupDate?: string;
  estimatedDeliveryDate?: string;
}

interface BarcodeDisplayProps {
  orderNumber: string;
  width?: number;
  height?: number;
  showDownload?: boolean;
  showPrint?: boolean;
  showOrderDetails?: boolean;
  orderDetails?: OrderDetails;
}

export default function BarcodeDisplay({ 
  orderNumber, 
  width = 250,
  height = 80,
  showDownload = true, 
  showPrint = true,
  showOrderDetails = true,
  orderDetails
}: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const displayOrderNumber = formatOrderNumber(orderNumber);
  // Use only alphanumeric characters for barcode
  const barcodeValue = orderNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  useEffect(() => {
    if (canvasRef.current && barcodeValue) {
      generateBarcode();
    }
  }, [barcodeValue, width, height]);

  const generateBarcode = () => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas not supported');
        return;
      }

      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Code 128 barcode patterns
      const code128Patterns: { [key: string]: number[] } = {
        'START_B': [2, 1, 1, 2, 1, 2],
        'STOP': [2, 3, 3, 1, 1, 1, 2],
        '0': [2, 1, 2, 2, 1, 2], '1': [2, 2, 2, 1, 1, 2], '2': [2, 2, 1, 2, 1, 2],
        '3': [1, 2, 1, 1, 2, 3], '4': [1, 2, 1, 3, 2, 1], '5': [1, 3, 1, 1, 2, 2],
        '6': [1, 2, 2, 1, 1, 3], '7': [1, 2, 2, 3, 1, 1], '8': [1, 3, 2, 1, 1, 2],
        '9': [2, 2, 1, 1, 1, 3], 'A': [2, 2, 1, 1, 3, 1], 'B': [2, 2, 3, 1, 1, 1],
        'C': [1, 1, 2, 2, 3, 1], 'D': [1, 1, 2, 3, 2, 1], 'E': [1, 3, 2, 2, 1, 1],
        'F': [1, 1, 3, 2, 2, 1], 'G': [2, 1, 1, 2, 3, 1], 'H': [2, 1, 3, 2, 1, 1],
        'I': [2, 1, 1, 3, 2, 1], 'J': [3, 1, 1, 2, 2, 1], 'K': [3, 1, 2, 2, 1, 1],
        'L': [3, 2, 1, 1, 2, 1], 'M': [3, 2, 1, 2, 1, 1], 'N': [3, 1, 2, 1, 2, 1],
        'O': [3, 2, 2, 1, 1, 1], 'P': [3, 1, 1, 1, 2, 2], 'Q': [1, 1, 1, 3, 2, 2],
        'R': [1, 2, 1, 2, 2, 2], 'S': [2, 2, 1, 2, 1, 2], 'T': [2, 2, 1, 2, 2, 1],
        'U': [2, 1, 2, 1, 2, 2], 'V': [2, 1, 2, 2, 2, 1], 'W': [1, 1, 1, 1, 3, 3],
        'X': [1, 1, 3, 1, 3, 1], 'Y': [3, 1, 1, 1, 3, 1], 'Z': [1, 1, 1, 3, 3, 1],
      };

      const barcodeHeight = height - 22;
      const startX = 15;
      const totalUnits = 11 + (barcodeValue.length * 11) + 13; // start + chars + stop
      const barWidth = (width - 30) / totalUnits;

      ctx.fillStyle = '#000000';

      let x = startX;
      
      // Draw start pattern
      const startPattern = code128Patterns['START_B'];
      startPattern.forEach((w, i) => {
        if (i % 2 === 0) ctx.fillRect(x, 8, w * barWidth, barcodeHeight);
        x += w * barWidth;
      });

      // Draw character patterns
      for (const char of barcodeValue) {
        const pattern = code128Patterns[char] || code128Patterns['0'];
        pattern.forEach((w, i) => {
          if (i % 2 === 0) ctx.fillRect(x, 8, w * barWidth, barcodeHeight);
          x += w * barWidth;
        });
      }

      // Draw stop pattern
      const stopPattern = code128Patterns['STOP'];
      stopPattern.forEach((w, i) => {
        if (i % 2 === 0) ctx.fillRect(x, 8, w * barWidth, barcodeHeight);
        x += w * barWidth;
      });

      // Draw text below barcode
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(displayOrderNumber, width / 2, height - 4);

      setIsLoading(false);
    } catch (err) {
      console.error('Barcode generation failed:', err);
      setError('Failed to generate barcode');
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `barcode-order-${displayOrderNumber}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Build order details HTML for print
    let orderDetailsHtml = '';
    if (showOrderDetails && orderDetails) {
      orderDetailsHtml = `
        <div class="order-details">
          <div class="detail-row">
            <span class="label">Status:</span>
            <span class="value status-${orderDetails.status}">${orderDetails.status.replace(/_/g, ' ').toUpperCase()}</span>
          </div>
          ${orderDetails.items ? `
            <div class="detail-row">
              <span class="label">Items:</span>
              <span class="value">${orderDetails.items.length} item(s)</span>
            </div>
          ` : ''}
          ${orderDetails.pricing ? `
            <div class="detail-row">
              <span class="label">Total:</span>
              <span class="value total">₹${orderDetails.pricing.total}</span>
            </div>
          ` : ''}
          ${orderDetails.estimatedDeliveryDate ? `
            <div class="detail-row">
              <span class="label">Est. Delivery:</span>
              <span class="value">${new Date(orderDetails.estimatedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
          ` : ''}
        </div>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order - ${displayOrderNumber}</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0; 
              font-family: Arial, sans-serif;
              background: #f5f5f5;
            }
            .container { 
              text-align: center; 
              padding: 30px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              min-width: 300px;
            }
            .title {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .order { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 15px;
              color: #14b8a6;
            }
            img {
              border: 2px solid #e5e5e5;
              border-radius: 8px;
              padding: 10px;
              background: white;
            }
            .order-details {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px dashed #ddd;
              text-align: left;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 13px;
            }
            .label { color: #666; }
            .value { font-weight: 600; color: #333; }
            .total { color: #14b8a6; font-size: 16px; }
            .status-delivered { color: #22c55e; }
            .status-in_process { color: #f59e0b; }
            .status-placed { color: #3b82f6; }
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">LaundryPro Order</div>
            <div class="order">#${displayOrderNumber}</div>
            <img src="${dataUrl}" alt="Barcode" />
            ${orderDetailsHtml}
          </div>
          <script>
            window.onload = () => { 
              setTimeout(() => {
                window.print(); 
                window.close(); 
              }, 300);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'in_process': 
      case 'ready': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'out_for_delivery': return 'text-blue-600 bg-blue-50';
      case 'in_process': 
      case 'ready': return 'text-amber-600 bg-amber-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (error) {
    return (
      <div className="inline-flex flex-col items-center gap-2 p-4 bg-red-50 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div className="bg-white p-3 rounded-xl border-2 border-gray-200 shadow-sm relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
          </div>
        )}
        <canvas ref={canvasRef} className="block" />
      </div>
      
      {/* Order Details Section */}
      {showOrderDetails && orderDetails && (
        <div className="w-full max-w-[280px] bg-gray-50 rounded-lg p-3 border border-gray-200">
          {/* Status */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Status</span>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(orderDetails.status)}`}>
              {getStatusIcon(orderDetails.status)}
              {orderDetails.status.replace(/_/g, ' ')}
            </span>
          </div>
          
          {/* Items Count */}
          {orderDetails.items && orderDetails.items.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Items</span>
              <span className="text-xs font-medium text-gray-700">
                {orderDetails.items.length} item(s)
              </span>
            </div>
          )}
          
          {/* Total */}
          {orderDetails.pricing && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-sm font-bold text-teal-600 flex items-center">
                <IndianRupee className="w-3 h-3" />
                {orderDetails.pricing.total}
              </span>
            </div>
          )}
          
          {/* Estimated Delivery */}
          {orderDetails.estimatedDeliveryDate && orderDetails.status !== 'delivered' && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Est. Delivery</span>
              <span className="text-xs font-medium text-gray-700">
                {new Date(orderDetails.estimatedDeliveryDate).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </span>
            </div>
          )}
        </div>
      )}
      
      {(showDownload || showPrint) && (
        <div className="flex gap-2">
          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          )}
          {showPrint && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Printer className="w-3 h-3" />
              Print
            </button>
          )}
        </div>
      )}
    </div>
  );
}

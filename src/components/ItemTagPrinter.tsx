'use client';

import { useState, useEffect, useRef } from 'react';
import { Printer, Download, Tag, Package, User, QrCode, Barcode, CheckCircle, X, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface ItemLabel {
  tagCode: string;
  orderNumber: string;
  orderBarcode: string;
  itemType: string;
  service: string;
  category: string;
  customerName: string;
  customerPhone: string;
  specialInstructions: string;
  createdAt: string;
  qrData: string;
  itemNumber: number;
  totalItems: number;
  printDate: string;
}

interface ItemTagPrinterProps {
  orderId: string;
  orderNumber: string;
  apiBaseUrl?: string;
  onClose?: () => void;
}

export default function ItemTagPrinter({ 
  orderId, 
  orderNumber, 
  apiBaseUrl = '',
  onClose 
}: ItemTagPrinterProps) {
  const [labels, setLabels] = useState<ItemLabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [labelSize, setLabelSize] = useState<'small' | 'medium' | 'large'>('medium');

  const labelSizes = {
    small: { width: 200, height: 120, qrSize: 50, fontSize: 8 },
    medium: { width: 280, height: 160, qrSize: 70, fontSize: 10 },
    large: { width: 380, height: 220, qrSize: 100, fontSize: 12 }
  };

  useEffect(() => {
    fetchLabels();
  }, [orderId]);

  useEffect(() => {
    // Generate QR codes for all labels
    generateQRCodes();
  }, [labels]);

  const fetchLabels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/barcode/order/${orderId}/labels`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLabels(data.data.labels);
        // Select all labels by default
        setSelectedLabels(new Set(data.data.labels.map((l: ItemLabel) => l.tagCode)));
      } else {
        setError(data.message || 'Failed to fetch labels');
      }
    } catch (err) {
      setError('Failed to fetch labels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCodes = async () => {
    const codes: Record<string, string> = {};
    
    for (const label of labels) {
      try {
        const dataUrl = await QRCode.toDataURL(label.qrData, {
          width: labelSizes[labelSize].qrSize,
          margin: 1,
          errorCorrectionLevel: 'M'
        });
        codes[label.tagCode] = dataUrl;
      } catch (err) {
        console.error('QR generation failed for', label.tagCode);
      }
    }
    
    setQrCodes(codes);
  };

  const toggleLabel = (tagCode: string) => {
    const newSelected = new Set(selectedLabels);
    if (newSelected.has(tagCode)) {
      newSelected.delete(tagCode);
    } else {
      newSelected.add(tagCode);
    }
    setSelectedLabels(newSelected);
  };

  const selectAll = () => {
    setSelectedLabels(new Set(labels.map(l => l.tagCode)));
  };

  const deselectAll = () => {
    setSelectedLabels(new Set());
  };

  const drawBarcode = (ctx: CanvasRenderingContext2D, code: string, x: number, y: number, width: number, height: number) => {
    const barWidth = width / (code.length * 11 + 35);
    
    ctx.fillStyle = '#000000';
    
    const startPattern = [2, 1, 1, 2, 3, 2];
    let currentX = x;
    startPattern.forEach((w, i) => {
      if (i % 2 === 0) ctx.fillRect(currentX, y, w * barWidth, height);
      currentX += w * barWidth;
    });

    const patterns: Record<string, number[]> = {
      '0': [2, 1, 2, 2, 2, 2], '1': [2, 2, 2, 1, 2, 2], '2': [2, 2, 2, 2, 2, 1],
      '3': [1, 2, 1, 2, 2, 3], '4': [1, 2, 1, 3, 2, 2], '5': [1, 3, 1, 2, 2, 2],
      '6': [1, 2, 2, 2, 1, 3], '7': [1, 2, 2, 3, 1, 2], '8': [1, 3, 2, 2, 1, 2],
      '9': [2, 2, 1, 2, 1, 3], 'I': [1, 2, 2, 1, 3, 2], 'T': [2, 1, 1, 3, 2, 2],
      'L': [1, 1, 3, 2, 2, 2], 'P': [2, 1, 1, 2, 2, 3]
    };

    for (const char of code) {
      const pattern = patterns[char] || [2, 1, 2, 1, 2, 2];
      pattern.forEach((w, i) => {
        if (i % 2 === 0) ctx.fillRect(currentX, y, w * barWidth, height);
        currentX += w * barWidth;
      });
    }

    const stopPattern = [2, 3, 3, 1, 1, 1, 2];
    stopPattern.forEach((w, i) => {
      if (i % 2 === 0) ctx.fillRect(currentX, y, w * barWidth, height);
      currentX += w * barWidth;
    });
  };

  const generateLabelCanvas = async (label: ItemLabel): Promise<HTMLCanvasElement> => {
    const config = labelSizes[labelSize];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = config.width;
    canvas.height = config.height;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, config.width, config.height);
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, config.width - 4, config.height - 4);
    
    const padding = 8;
    let yPos = padding + 5;
    
    // Header - Order Number
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${config.fontSize + 2}px Arial`;
    ctx.fillText(`Order: ${label.orderNumber}`, padding, yPos);
    
    // Item count badge
    ctx.font = `${config.fontSize}px Arial`;
    const itemText = `${label.itemNumber}/${label.totalItems}`;
    const itemTextWidth = ctx.measureText(itemText).width;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(config.width - padding - itemTextWidth - 8, yPos - config.fontSize, itemTextWidth + 8, config.fontSize + 4);
    ctx.fillStyle = '#000000';
    ctx.fillText(itemText, config.width - padding - itemTextWidth - 4, yPos);
    
    yPos += config.fontSize + 8;
    
    // Customer name
    ctx.font = `bold ${config.fontSize}px Arial`;
    ctx.fillText(label.customerName, padding, yPos);
    yPos += config.fontSize + 4;
    
    // Item type and service
    ctx.font = `${config.fontSize}px Arial`;
    ctx.fillText(`${label.itemType} - ${label.service}`, padding, yPos);
    yPos += config.fontSize + 4;
    
    // Category
    ctx.fillStyle = '#666666';
    ctx.fillText(`Category: ${label.category}`, padding, yPos);
    yPos += config.fontSize + 6;
    
    // Special instructions (if any)
    if (label.specialInstructions) {
      ctx.fillStyle = '#cc6600';
      ctx.font = `italic ${config.fontSize - 1}px Arial`;
      const maxWidth = config.width - config.qrSize - padding * 3;
      const truncated = label.specialInstructions.length > 30 
        ? label.specialInstructions.substring(0, 30) + '...' 
        : label.specialInstructions;
      ctx.fillText(`📝 ${truncated}`, padding, yPos);
    }
    
    // QR Code (right side)
    const qrX = config.width - config.qrSize - padding;
    const qrY = padding + config.fontSize + 10;
    
    if (qrCodes[label.tagCode]) {
      const qrImg = new Image();
      await new Promise<void>((resolve) => {
        qrImg.onload = () => {
          ctx.drawImage(qrImg, qrX, qrY, config.qrSize, config.qrSize);
          resolve();
        };
        qrImg.src = qrCodes[label.tagCode];
      });
    }
    
    // Barcode at bottom
    const barcodeY = config.height - 35;
    const barcodeWidth = config.width - padding * 2;
    drawBarcode(ctx, label.tagCode, padding, barcodeY, barcodeWidth, 20);
    
    // Tag code text
    ctx.fillStyle = '#000000';
    ctx.font = `${config.fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(label.tagCode, config.width / 2, config.height - 5);
    ctx.textAlign = 'left';
    
    return canvas;
  };

  const handlePrint = async () => {
    const selectedLabelData = labels.filter(l => selectedLabels.has(l.tagCode));
    if (selectedLabelData.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Generate all label images
    const labelImages: string[] = [];
    for (const label of selectedLabelData) {
      const canvas = await generateLabelCanvas(label);
      labelImages.push(canvas.toDataURL('image/png'));
    }
    
    const config = labelSizes[labelSize];
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Item Tags - Order ${orderNumber}</title>
          <style>
            @page {
              size: auto;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 10px;
              font-family: Arial, sans-serif;
            }
            .labels-container {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              justify-content: flex-start;
            }
            .label {
              page-break-inside: avoid;
              border: 1px dashed #ccc;
              padding: 5px;
            }
            .label img {
              display: block;
              width: ${config.width}px;
              height: ${config.height}px;
            }
            @media print {
              .label {
                border: none;
                padding: 2px;
              }
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
            ${labelImages.map(img => `<div class="label"><img src="${img}" /></div>`).join('')}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = async () => {
    const selectedLabelData = labels.filter(l => selectedLabels.has(l.tagCode));
    if (selectedLabelData.length === 0) return;
    
    // If single label, download directly
    if (selectedLabelData.length === 1) {
      const canvas = await generateLabelCanvas(selectedLabelData[0]);
      const link = document.createElement('a');
      link.download = `tag-${selectedLabelData[0].tagCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      return;
    }
    
    // Multiple labels - create a combined image
    const config = labelSizes[labelSize];
    const cols = 2;
    const rows = Math.ceil(selectedLabelData.length / cols);
    const gap = 10;
    
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = cols * config.width + (cols - 1) * gap + 20;
    combinedCanvas.height = rows * config.height + (rows - 1) * gap + 20;
    
    const ctx = combinedCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
    
    for (let i = 0; i < selectedLabelData.length; i++) {
      const canvas = await generateLabelCanvas(selectedLabelData[i]);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 10 + col * (config.width + gap);
      const y = 10 + row * (config.height + gap);
      ctx.drawImage(canvas, x, y);
    }
    
    const link = document.createElement('a');
    link.download = `tags-order-${orderNumber}.png`;
    link.href = combinedCanvas.toDataURL('image/png');
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        <span className="ml-3 text-gray-600">Loading labels...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={fetchLabels}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-lg font-semibold text-white">Print Item Tags</h2>
            <p className="text-white/80 text-sm">Order: {orderNumber}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 py-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Size:</span>
            <select
              value={labelSize}
              onChange={(e) => setLabelSize(e.target.value as 'small' | 'medium' | 'large')}
              className="px-3 py-1.5 border rounded-lg text-sm"
            >
              <option value="small">Small (2" x 1")</option>
              <option value="medium">Medium (2.5" x 1.5")</option>
              <option value="large">Large (3.5" x 2")</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={deselectAll}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Deselect All
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {selectedLabels.size} of {labels.length} selected
          </span>
        </div>
      </div>

      {/* Labels Grid */}
      <div className="p-6 max-h-[400px] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labels.map((label) => (
            <div
              key={label.tagCode}
              onClick={() => toggleLabel(label.tagCode)}
              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedLabels.has(label.tagCode)
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {selectedLabels.has(label.tagCode) && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {qrCodes[label.tagCode] ? (
                    <img 
                      src={qrCodes[label.tagCode]} 
                      alt="QR" 
                      className="w-16 h-16 rounded border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                      {label.tagCode}
                    </span>
                    <span className="text-xs text-gray-500">
                      {label.itemNumber}/{label.totalItems}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 truncate">{label.itemType}</p>
                  <p className="text-sm text-gray-600">{label.service}</p>
                  <p className="text-xs text-gray-500">{label.category}</p>
                  {label.specialInstructions && (
                    <p className="text-xs text-orange-600 mt-1 truncate">
                      📝 {label.specialInstructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {labels.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No items found for this order</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
        <button
          onClick={handleDownload}
          disabled={selectedLabels.size === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={handlePrint}
          disabled={selectedLabels.size === 0}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Tags ({selectedLabels.size})
        </button>
      </div>
    </div>
  );
}

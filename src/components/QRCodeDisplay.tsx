'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Printer, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { formatOrderNumber } from '@/utils/orderUtils';

interface QRCodeDisplayProps {
  data: string;
  orderNumber: string;
  size?: number;
  showDownload?: boolean;
  showPrint?: boolean;
}

export default function QRCodeDisplay({ 
  data, 
  orderNumber, 
  size = 150,
  showDownload = true, 
  showPrint = true 
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const displayOrderNumber = formatOrderNumber(orderNumber);

  useEffect(() => {
    if (canvasRef.current && data) {
      generateQRCode();
    }
  }, [data, size]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M' // Medium error correction
      });
      setIsLoading(false);
    } catch (err) {
      console.error('QR Code generation failed:', err);
      setError('Failed to generate QR code');
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H' // High error correction for download
      });
      
      const link = document.createElement('a');
      link.download = `qr-order-${displayOrderNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handlePrint = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(data, {
        width: 400,
        margin: 3,
        errorCorrectionLevel: 'H'
      });
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${displayOrderNumber}</title>
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
              }
              .scan-text {
                margin-top: 10px;
                font-size: 12px;
                color: #888;
              }
              @media print {
                body { background: white; }
                .container { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="title">LaundryLobby Order</div>
              <div class="order">#${displayOrderNumber}</div>
              <img src="${dataUrl}" alt="QR Code" />
              <div class="scan-text">Scan to view order details</div>
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
    } catch (err) {
      console.error('Print failed:', err);
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
      <p className="text-xs text-gray-500 text-center">Scan to view order details</p>
      
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

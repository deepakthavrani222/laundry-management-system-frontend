'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Printer, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface OrderQRCodeProps {
  orderNumber: string;
  orderId: string;
  barcode?: string;
  showDownload?: boolean;
  showPrint?: boolean;
  size?: 'small' | 'medium' | 'large';
  showBarcode?: boolean; // Show both QR and barcode
  mode?: 'full' | 'barcode-only' | 'qr-only'; // Display mode
}

export default function OrderQRCode({ 
  orderNumber, 
  orderId,
  barcode,
  showDownload = true, 
  showPrint = true,
  size = 'medium',
  showBarcode = true,
  mode = 'full'
}: OrderQRCodeProps) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const sizeConfig = {
    small: { qrSize: 100, barcodeWidth: 150, barcodeHeight: 50, fontSize: 10 },
    medium: { qrSize: 150, barcodeWidth: 200, barcodeHeight: 60, fontSize: 12 },
    large: { qrSize: 200, barcodeWidth: 280, barcodeHeight: 80, fontSize: 14 }
  };

  const config = sizeConfig[size];

  // Generate QR code URL - points to order tracking page
  const getOrderUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/track/${orderNumber}`;
  };

  useEffect(() => {
    generateQRCode();
    if (showBarcode && barcode && barcodeCanvasRef.current) {
      drawBarcode(barcodeCanvasRef.current, barcode);
    }
  }, [orderNumber, barcode, size]);

  const generateQRCode = async () => {
    try {
      const url = getOrderUrl();
      const dataUrl = await QRCode.toDataURL(url, {
        width: config.qrSize,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR Code generation failed:', err);
    }
  };

  const drawBarcode = (canvas: HTMLCanvasElement, code: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = config.barcodeWidth;
    canvas.height = config.barcodeHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, config.barcodeWidth, config.barcodeHeight);

    const barcodeHeight = config.barcodeHeight - 18;
    const startX = 10;
    const barWidth = (config.barcodeWidth - 20) / (code.length * 11 + 35);

    ctx.fillStyle = '#000000';

    const startPattern = [2, 1, 1, 2, 3, 2];
    let x = startX;
    startPattern.forEach((width, i) => {
      if (i % 2 === 0) ctx.fillRect(x, 5, width * barWidth, barcodeHeight);
      x += width * barWidth;
    });

    const patterns: Record<string, number[]> = {
      '0': [2, 1, 2, 2, 2, 2], '1': [2, 2, 2, 1, 2, 2], '2': [2, 2, 2, 2, 2, 1],
      '3': [1, 2, 1, 2, 2, 3], '4': [1, 2, 1, 3, 2, 2], '5': [1, 3, 1, 2, 2, 2],
      '6': [1, 2, 2, 2, 1, 3], '7': [1, 2, 2, 3, 1, 2], '8': [1, 3, 2, 2, 1, 2],
      '9': [2, 2, 1, 2, 1, 3], 'L': [1, 1, 3, 2, 2, 2], 'P': [2, 1, 1, 2, 2, 3]
    };

    for (const char of code) {
      const pattern = patterns[char] || [2, 1, 2, 1, 2, 2];
      pattern.forEach((width, i) => {
        if (i % 2 === 0) ctx.fillRect(x, 5, width * barWidth, barcodeHeight);
        x += width * barWidth;
      });
    }

    const stopPattern = [2, 3, 3, 1, 1, 1, 2];
    stopPattern.forEach((width, i) => {
      if (i % 2 === 0) ctx.fillRect(x, 5, width * barWidth, barcodeHeight);
      x += width * barWidth;
    });

    ctx.font = `${config.fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(code, config.barcodeWidth / 2, config.barcodeHeight - 3);
  };

  const handleDownload = () => {
    // Create combined image with QR and barcode
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 20;
    const gap = 15;
    
    if (showBarcode && barcode) {
      canvas.width = Math.max(config.qrSize, config.barcodeWidth) + padding * 2;
      canvas.height = config.qrSize + config.barcodeHeight + gap + padding * 2 + 30;
    } else {
      canvas.width = config.qrSize + padding * 2;
      canvas.height = config.qrSize + padding * 2 + 30;
    }

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw order number header
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Order: ${orderNumber}`, canvas.width / 2, 20);

    // Draw QR code
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrX = (canvas.width - config.qrSize) / 2;
      ctx.drawImage(qrImg, qrX, 30, config.qrSize, config.qrSize);

      // Draw barcode if enabled
      if (showBarcode && barcode && barcodeCanvasRef.current) {
        const barcodeX = (canvas.width - config.barcodeWidth) / 2;
        ctx.drawImage(barcodeCanvasRef.current, barcodeX, 30 + config.qrSize + gap);
      }

      // Download
      const link = document.createElement('a');
      link.download = `order-${orderNumber}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    qrImg.src = qrDataUrl;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const barcodeDataUrl = barcodeCanvasRef.current?.toDataURL('image/png') || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order ${orderNumber}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
              padding: 20px;
              border: 2px dashed #ccc;
              border-radius: 8px;
            }
            .order-number {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            .qr-code {
              margin-bottom: 15px;
            }
            .scan-text {
              font-size: 12px;
              color: #666;
              margin-top: 10px;
            }
            @media print {
              .container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="order-number">Order: ${orderNumber}</div>
            <div class="qr-code">
              <img src="${qrDataUrl}" alt="QR Code" width="${config.qrSize}" />
            </div>
            ${showBarcode && barcode ? `<img src="${barcodeDataUrl}" alt="Barcode" />` : ''}
            <div class="scan-text">Scan QR code to track order</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="inline-flex flex-col items-center gap-3">
      {/* Barcode-only mode for list views */}
      {mode === 'barcode-only' && barcode && (
        <div className="inline-flex flex-col items-center">
          <canvas ref={barcodeCanvasRef} className="rounded border border-gray-200" />
        </div>
      )}

      {/* QR-only mode */}
      {mode === 'qr-only' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Order QR Code" width={config.qrSize} height={config.qrSize} />
          ) : (
            <div 
              className="flex items-center justify-center bg-gray-100" 
              style={{ width: config.qrSize, height: config.qrSize }}
            >
              <QrCode className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
          )}
          <p className="text-xs text-center text-gray-500 mt-2">Scan to track order</p>
        </div>
      )}

      {/* Full mode - QR Code + Barcode */}
      {mode === 'full' && (
        <>
          {/* QR Code */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Order QR Code" width={config.qrSize} height={config.qrSize} />
            ) : (
              <div 
                className="flex items-center justify-center bg-gray-100" 
                style={{ width: config.qrSize, height: config.qrSize }}
              >
                <QrCode className="w-8 h-8 text-gray-400 animate-pulse" />
              </div>
            )}
            <p className="text-xs text-center text-gray-500 mt-2">Scan to track order</p>
          </div>

          {/* Barcode (hidden, used for download/print) */}
          {showBarcode && barcode && (
            <canvas ref={barcodeCanvasRef} className="hidden" />
          )}
        </>
      )}
      
      {/* Actions */}
      {(showDownload || showPrint) && mode === 'full' && (
        <div className="flex gap-2">
          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors shadow-sm border border-gray-200"
              title="Download QR Code"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          )}
          {showPrint && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors shadow-sm border border-gray-200"
              title="Print QR Code"
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

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { X, Printer, Download, Share2, Settings, Check } from 'lucide-react';
import ReceiptTemplate from './ReceiptTemplate';
import type { ReceiptData, PrintSettings } from './types';
import { DEFAULT_PRINT_SETTINGS } from './types';
import { buildReceiptESCPOS, printViaWebUSB, printViaWebSerial } from './escpos';

interface ReceiptPreviewModalProps {
  show: boolean;
  onClose: () => void;
  data: ReceiptData;
}

export default function ReceiptPreviewModal({ show, onClose, data }: ReceiptPreviewModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [shared, setShared] = useState(false);
  
  // Persist print settings in local storage
  const [settings, setSettings] = useState<PrintSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cafecanva_print_settings');
        if (saved) {
          return { ...DEFAULT_PRINT_SETTINGS, ...JSON.parse(saved) };
        }
      } catch (err) {
        console.error('Failed to load print settings:', err);
      }
    }
    return DEFAULT_PRINT_SETTINGS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cafecanva_print_settings', JSON.stringify(settings));
      } catch (err) {
        console.error('Failed to save print settings:', err);
      }
    }
  }, [settings]);

  const [showSettings, setShowSettings] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');

  useEffect(() => {
    if (data.customerPhone) {
      const cleanPhone = data.customerPhone.replace(/\D/g, '').slice(-10);
      setWhatsappPhone(cleanPhone);
    } else {
      setWhatsappPhone('');
    }
  }, [data.customerPhone, show]);

  // ─── BROWSER PRINT ───
  const handleBrowserPrint = useCallback(() => {
    if (!receiptRef.current) return;
    setPrinting(true);

    const printContent = receiptRef.current.innerHTML;

    // Check if running in Electron environment with printReceipt API
    if (typeof window !== 'undefined' && (window as any).electronAPI?.printReceipt) {
      try {
        const styledContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Courier New', 'Courier', monospace;
                width: ${settings.paperWidth === 58 ? '219px' : '302px'};
                padding: 10px;
              }
            </style>
          </head>
          <body>${printContent}</body>
          </html>
        `;
        (window as any).electronAPI.printReceipt(styledContent);
        setPrinting(false);
        return;
      } catch (err) {
        console.error('Electron silent print failed, falling back to browser:', err);
      }
    }

    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (!printWindow) {
      setPrinting(false);
      alert('Please allow popups for printing.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${data.billId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Courier New', 'Courier', monospace;
            width: ${settings.paperWidth === 58 ? '219px' : '302px'};
            margin: 0 auto;
          }
          @media print {
            @page { 
              size: ${settings.paperWidth}mm auto;
              margin: 0;
            }
            body { width: 100%; }
          }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Close after a small delay to allow the print dialog
      setTimeout(() => {
        printWindow.close();
        setPrinting(false);
      }, 1000);
    };
  }, [data.billId, settings.paperWidth]);

  // ─── GENERAL PRINT CONTROLLER ───
  const handlePrint = useCallback(async () => {
    if (settings.method === 'browser') {
      handleBrowserPrint();
    } else if (settings.method === 'escpos') {
      if (!receiptRef.current) return;
      setPrinting(true);
      try {
        const escposItems = data.items.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
          total: typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0,
        }));

        const escposData = {
          storeName: data.storeName,
          storeAddress: data.storeAddress,
          storePhone: data.storePhone,
          gstNumber: data.gstNumber,
          billId: data.billId,
          tableName: data.tableName,
          dateTime: data.dateTime || new Date().toLocaleString('en-IN'),
          items: escposItems,
          subtotal: data.subtotal,
          gstAmount: data.gstAmount,
          gstPercent: data.gstPercent,
          serviceCharge: data.serviceCharge,
          servicePercent: data.servicePercent,
          discountAmount: data.discountAmount,
          discountPercent: data.discountPercent,
          grandTotal: data.grandTotal,
          paymentMethod: data.paymentMethod,
          cashReceived: data.cashReceived,
          changeDue: data.changeDue,
          footerMessage: data.footerMessage,
        };

        const bytes = buildReceiptESCPOS(escposData, settings.paperWidth);
        const success = await printViaWebUSB(bytes);
        if (!success) {
          const serialSuccess = await printViaWebSerial(bytes);
          if (!serialSuccess) {
            alert('Failed to print via ESC/POS USB or Serial. Please check connection and permissions.');
          }
        }
      } catch (err) {
        console.error('ESC/POS printing failed:', err);
        alert('Failed to print via ESC/POS printer.');
      } finally {
        setPrinting(false);
      }
    } else if (settings.method === 'network') {
      if (!settings.networkIp) {
        alert('Please configure Network Printer IP in settings.');
        setShowSettings(true);
        return;
      }
      setPrinting(true);
      try {
        const escposItems = data.items.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
          total: typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0,
        }));

        const escposData = {
          storeName: data.storeName,
          storeAddress: data.storeAddress,
          storePhone: data.storePhone,
          gstNumber: data.gstNumber,
          billId: data.billId,
          tableName: data.tableName,
          dateTime: data.dateTime || new Date().toLocaleString('en-IN'),
          items: escposItems,
          subtotal: data.subtotal,
          gstAmount: data.gstAmount,
          gstPercent: data.gstPercent,
          serviceCharge: data.serviceCharge,
          servicePercent: data.servicePercent,
          discountAmount: data.discountAmount,
          discountPercent: data.discountPercent,
          grandTotal: data.grandTotal,
          paymentMethod: data.paymentMethod,
          cashReceived: data.cashReceived,
          changeDue: data.changeDue,
          footerMessage: data.footerMessage,
        };

        const bytes = buildReceiptESCPOS(escposData, settings.paperWidth);
        const byteArray = Array.from(bytes);

        const response = await fetch('/api/print/network', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ip: settings.networkIp,
            port: settings.networkPort || 9100,
            payload: byteArray
          })
        });
        const resData = await response.json();
        if (response.ok && resData.success) {
          alert('Sent print job to network printer.');
        } else {
          throw new Error(resData.error || 'Server returned error status');
        }
      } catch (err: any) {
        console.error('Network print error:', err);
        alert(`Failed to print to network printer: ${err.message || 'Check connection.'}`);
      } finally {
        setPrinting(false);
      }
    }
  }, [settings, data, handleBrowserPrint]);

  // ─── PDF DOWNLOAD ───
  const handleDownloadPDF = useCallback(async () => {
    if (!receiptRef.current) return;
    setDownloaded(false);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const paperWidthMM = settings.paperWidth;
      const imgWidth = paperWidthMM;
      const imgHeight = (canvas.height * paperWidthMM) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [paperWidthMM, imgHeight + 10],
      });

      pdf.addImage(imgData, 'PNG', 0, 5, imgWidth, imgHeight);

      const fileName = `Receipt_${data.billId}_${data.tableName.replace(/\s+/g, '')}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try browser print instead.');
    }
  }, [data, settings.paperWidth]);

  // ─── WHATSAPP SHARE ───
  const handleWhatsAppShare = useCallback(() => {
    const items = data.items.map(i => `${i.name} x${i.qty} = ₹${i.total}`).join('\n');
    const message = encodeURIComponent(
      `🧾 *${data.storeName}*\n` +
      `━━━━━━━━━━━━━━━\n` +
      `Bill: ${data.billId}\n` +
      `Table: ${data.tableName}\n` +
      `Date: ${data.dateTime}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `${items}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `Subtotal: ₹${data.subtotal.toLocaleString()}\n` +
      (data.gstAmount > 0 ? `GST (${data.gstPercent}%): ₹${data.gstAmount.toLocaleString()}\n` : '') +
      (data.serviceCharge > 0 ? `Service (${data.servicePercent}%): ₹${data.serviceCharge.toLocaleString()}\n` : '') +
      (data.discountAmount > 0 ? `Discount: -₹${data.discountAmount.toLocaleString()}\n` : '') +
      `━━━━━━━━━━━━━━━\n` +
      `*TOTAL: ₹${data.grandTotal.toLocaleString()}*\n` +
      `Paid via: ${data.paymentMethod.toUpperCase()}\n\n` +
      `${data.footerMessage}`
    );
    const targetUrl = whatsappPhone.length === 10
      ? `https://wa.me/91${whatsappPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(targetUrl, '_blank');
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  }, [data, whatsappPhone]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(41,37,36,0.40)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff', border: '1px solid #e7e5e4',
          borderRadius: '16px', width: '100%', maxWidth: '480px',
          maxHeight: '95vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', boxShadow: '0 24px 80px rgba(120,113,108,0.15)',
        }}
      >
        {/* ─── HEADER ─── */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f5f5f4',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Printer size={16} color="#b45309" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917' }}>
                Receipt Preview
              </div>
              <div style={{ fontSize: '10px', color: '#78716c' }}>
                {data.billId} · {data.tableName}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: showSettings ? 'rgba(217,119,6,0.08)' : '#f5f5f4',
                border: '1px solid #e7e5e4', borderRadius: '8px',
                padding: '6px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Settings size={16} color={showSettings ? '#b45309' : '#78716c'} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#f5f5f4',
                border: '1px solid #e7e5e4', borderRadius: '8px',
                padding: '6px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} color="#78716c" />
            </button>
          </div>
        </div>

        {/* ─── SETTINGS PANEL ─── */}
        {showSettings && (
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid #f5f5f4',
            background: '#fafaf9',
          }}>
            <div style={{
              fontSize: '10px', fontWeight: 700, color: '#78716c',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px',
            }}>
              Print Settings
            </div>
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px', color: '#57534e', display: 'block', marginBottom: '4px' }}>
                    Paper Width
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {([58, 80] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setSettings((p) => ({ ...p, paperWidth: w }))}
                        style={{
                          padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                          cursor: 'pointer', border: '1px solid',
                          background: settings.paperWidth === w ? 'rgba(217,119,6,0.08)' : 'transparent',
                          color: settings.paperWidth === w ? '#b45309' : '#57534e',
                          borderColor: settings.paperWidth === w ? 'rgba(217,119,6,0.3)' : '#e7e5e4',
                        }}
                      >
                        {w}mm
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px', color: '#57534e', display: 'block', marginBottom: '4px' }}>
                    Print Method
                  </label>
                  <select
                    value={settings.method}
                    onChange={(e) => setSettings((p) => ({ ...p, method: e.target.value as PrintSettings['method'] }))}
                    style={{
                      background: '#ffffff', border: '1px solid #e7e5e4',
                      borderRadius: '6px', padding: '5px 8px', color: '#1c1917', fontSize: '11px',
                      outline: 'none', width: '100%', cursor: 'pointer',
                    }}
                  >
                    <option value="browser">Browser Print</option>
                    <option value="escpos">ESC/POS USB</option>
                    <option value="network">Network Printer</option>
                  </select>
                </div>
              </div>

              {settings.method === 'network' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: '10px', color: '#57534e', display: 'block', marginBottom: '4px' }}>
                      Printer IP Address
                    </label>
                    <input
                      type="text"
                      placeholder="192.168.1.100"
                      value={settings.networkIp || ''}
                      onChange={(e) => setSettings((p) => ({ ...p, networkIp: e.target.value }))}
                      style={{
                        background: '#ffffff', border: '1px solid #e7e5e4',
                        borderRadius: '6px', padding: '5px 8px', color: '#1c1917', fontSize: '11px',
                        outline: 'none', width: '100%',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10px', color: '#57534e', display: 'block', marginBottom: '4px' }}>
                      Port
                    </label>
                    <input
                      type="number"
                      placeholder="9100"
                      value={settings.networkPort || ''}
                      onChange={(e) => setSettings((p) => ({ ...p, networkPort: parseInt(e.target.value) || undefined }))}
                      style={{
                        background: '#ffffff', border: '1px solid #e7e5e4',
                        borderRadius: '6px', padding: '5px 8px', color: '#1c1917', fontSize: '11px',
                        outline: 'none', width: '100%',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── RECEIPT CONTENT (scrollable) ─── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px',
          background: '#fafaf9',
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            boxShadow: '0 8px 40px rgba(120,113,108,0.08)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <ReceiptTemplate ref={receiptRef} data={data} paperWidth={settings.paperWidth} />
          </div>
        </div>

        {/* ─── WHATSAPP NUMBER INPUT ─── */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #f5f5f4',
          background: '#fafaf9',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#57534e' }}>
            Customer WhatsApp Number (to send bill directly)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{
              display: 'flex', alignItems: 'center', background: '#f5f5f4',
              border: '1px solid #e7e5e4', borderRadius: '8px', padding: '0 10px',
              fontSize: '12px', color: '#78716c', fontWeight: 600
            }}>
              +91
            </span>
            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={{
                flex: 1, background: '#ffffff', border: '1px solid #e7e5e4',
                borderRadius: '8px', padding: '6px 12px', color: '#1c1917', fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* ─── ACTION BUTTONS ─── */}
        <div style={{
          padding: '16px 20px', borderTop: '1px solid #f5f5f4',
          display: 'flex', gap: '8px', background: '#fafaf9',
        }}>
          <ActionButton
            icon={printing ? <Spinner /> : <Printer size={16} />}
            label={printing ? 'Printing…' : 'Print Receipt'}
            onClick={handlePrint}
            primary
            disabled={printing}
          />
          <ActionButton
            icon={downloaded ? <Check size={16} color="#10b981" /> : <Download size={16} />}
            label={downloaded ? 'Downloaded!' : 'PDF'}
            onClick={handleDownloadPDF}
          />
          <ActionButton
            icon={shared ? <Check size={16} color="#10b981" /> : <Share2 size={16} />}
            label={shared ? 'Shared!' : 'WhatsApp'}
            onClick={handleWhatsAppShare}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Helper Components ─── */

function ActionButton({
  icon, label, onClick, primary = false, disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: primary ? 2 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '12px', fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        background: primary
          ? (hov ? '#b45309' : '#d97706')
          : (hov ? '#e7e5e4' : '#f5f5f4'),
        color: primary ? '#fff' : '#57534e',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff', borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  );
}

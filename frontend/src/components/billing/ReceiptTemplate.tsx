'use client';

import React, { forwardRef } from 'react';
import type { ReceiptData } from './types';

/**
 * ReceiptTemplate — A pixel-perfect thermal receipt layout.
 * Renders at 302px width (80mm thermal paper).
 * Uses monospace font for alignment like real receipts.
 */
const ReceiptTemplate = forwardRef<HTMLDivElement, { data: ReceiptData }>(
  ({ data }, ref) => {
    const now = data.dateTime || new Date().toLocaleString('en-IN');

    return (
      <div
        ref={ref}
        id="receipt-print-area"
        style={{
          width: '302px',
          padding: '12px 8px',
          fontFamily: "'Courier New', 'Courier', monospace",
          fontSize: '12px',
          lineHeight: 1.5,
          color: '#000',
          background: '#fff',
          margin: '0 auto',
        }}
      >
        {/* ─── STORE HEADER ─── */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '2px' }}>
            {data.storeName}
          </div>
          <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
            {data.storeAddress}
          </div>
          <div style={{ fontSize: '10px', color: '#555' }}>
            Ph: {data.storePhone}
          </div>
          {data.gstNumber && (
            <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
              GSTIN: {data.gstNumber}
            </div>
          )}
          {data.fssaiNumber && (
            <div style={{ fontSize: '10px', color: '#555' }}>
              FSSAI: {data.fssaiNumber}
            </div>
          )}
        </div>

        <Separator />

        {/* ─── BILL INFO ─── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
          <span>Bill: <strong>{data.billId}</strong></span>
          <span>{data.tableName}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}>
          <span>{now}</span>
          <span>{data.tableSection}</span>
        </div>

        <Separator />

        {/* ─── ITEMS TABLE ─── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ borderBottom: '1px dashed #999' }}>
              <th style={{ textAlign: 'left', padding: '4px 0', fontWeight: 700 }}>Item</th>
              <th style={{ textAlign: 'center', padding: '4px 0', fontWeight: 700, width: '30px' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '4px 0', fontWeight: 700, width: '50px' }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '4px 0', fontWeight: 700, width: '60px' }}>Amt</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i}>
                <td style={{ padding: '3px 0', fontSize: '11px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </td>
                <td style={{ textAlign: 'center', padding: '3px 0' }}>{item.qty}</td>
                <td style={{ textAlign: 'right', padding: '3px 0' }}>₹{item.price}</td>
                <td style={{ textAlign: 'right', padding: '3px 0', fontWeight: 600 }}>₹{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Separator style="dashed" />

        {/* ─── TOTALS ─── */}
        <div style={{ fontSize: '11px' }}>
          <TotalRow label="Subtotal" value={data.subtotal} />
          {data.cgstAmount != null && data.cgstAmount > 0 ? (
            <>
              <TotalRow label={`CGST (${data.cgstPercent || 0}%)`} value={data.cgstAmount} />
              <TotalRow label={`SGST (${data.sgstPercent || 0}%)`} value={data.sgstAmount || 0} />
            </>
          ) : (
            data.gstAmount > 0 && (
              <TotalRow label={`GST (${data.gstPercent}%)`} value={data.gstAmount} />
            )
          )}
          {data.serviceCharge > 0 && (
            <TotalRow
              label={
                data.serviceChargeType === 'flat'
                  ? 'Service Charge'
                  : `Service (${data.servicePercent || 0}%)`
              }
              value={data.serviceCharge}
            />
          )}
          {data.customCharges?.map((c, i) => (
            <TotalRow key={i} label={c.label} value={c.amount} />
          ))}
          {data.discountAmount > 0 && (
            <TotalRow
              label={`Discount (${data.discountPercent}%)${data.couponCode ? ` [${data.couponCode}]` : ''}`}
              value={-data.discountAmount}
              highlight
            />
          )}
        </div>

        <Separator style="double" />

        {/* ─── GRAND TOTAL ─── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 900,
          padding: '6px 0', letterSpacing: '0.5px'
        }}>
          <span>TOTAL</span>
          <span>₹{data.grandTotal.toLocaleString()}</span>
        </div>

        <Separator style="double" />

        {/* ─── PAYMENT INFO ─── */}
        <div style={{ fontSize: '11px', marginBottom: '4px' }}>
          <TotalRow label="Payment" value={data.paymentMethod.toUpperCase()} isText />
          {data.cashReceived != null && data.cashReceived > 0 && (
            <>
              <TotalRow label="Cash Received" value={data.cashReceived} />
              <TotalRow label="Change Due" value={data.changeDue || 0} highlight />
            </>
          )}
        </div>

        <Separator />

        {/* ─── FOOTER ─── */}
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#666', padding: '6px 0' }}>
          <div style={{ marginBottom: '4px' }}>{data.footerMessage}</div>
          <div style={{ fontSize: '9px', color: '#999' }}>
            Powered by CafeCanva · cafecanva.com
          </div>
        </div>

        {/* ─── CUT LINE (for thermal printers) ─── */}
        <div style={{
          textAlign: 'center', fontSize: '10px', color: '#ccc', marginTop: '8px',
          borderTop: '1px dashed #ccc', paddingTop: '4px'
        }}>
          ✂ - - - - - - - - - - - - - - - - - - - -
        </div>
      </div>
    );
  }
);

ReceiptTemplate.displayName = 'ReceiptTemplate';

/* ─── Helper Components ─── */

function Separator({ style: lineStyle = 'solid' }: { style?: 'solid' | 'dashed' | 'double' }) {
  const borderMap = {
    solid: '1px solid #ddd',
    dashed: '1px dashed #ccc',
    double: '3px double #bbb',
  };
  return <div style={{ borderBottom: borderMap[lineStyle], margin: '6px 0' }} />;
}

function TotalRow({
  label,
  value,
  highlight = false,
  isText = false,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
  isText?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '2px 0',
      color: highlight ? '#e53e3e' : '#333',
      fontWeight: highlight ? 700 : 400,
    }}>
      <span>{label}</span>
      <span>
        {isText
          ? value
          : typeof value === 'number'
            ? `${value < 0 ? '-' : ''}₹${Math.abs(value).toLocaleString()}`
            : value}
      </span>
    </div>
  );
}

export default ReceiptTemplate;

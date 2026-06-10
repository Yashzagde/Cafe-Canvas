// Receipt Data Types for Cafe Canva Bill Generator

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface ReceiptCustomCharge {
  label: string;
  amount: number;
}

export interface ReceiptData {
  billId: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  gstNumber: string;
  tableName: string;
  tableSection: string;
  items: ReceiptItem[];
  customCharges: ReceiptCustomCharge[];
  subtotal: number;
  gstAmount: number;
  gstPercent: number;
  cgstPercent?: number;
  cgstAmount?: number;
  sgstPercent?: number;
  sgstAmount?: number;
  serviceCharge: number;
  servicePercent: number;
  serviceChargeType?: 'percent' | 'flat';
  discountPercent: number;
  discountAmount: number;
  couponCode: string;
  grandTotal: number;
  paymentMethod: string;
  cashReceived?: number;
  changeDue?: number;
  dateTime: string;
  footerMessage: string;
  fssaiNumber?: string;
  logoUrl?: string;
  extraChargesAmount?: number;
  extraChargesLabel?: string;
  customerPhone?: string;
}

export type PrintMethod = 'browser' | 'escpos' | 'network';

export interface PrintSettings {
  method: PrintMethod;
  paperWidth: 58 | 80;
  autoPrint: boolean;
  showPreview: boolean;
  printerName?: string;
  networkIp?: string;
  networkPort?: number;
}

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  method: 'browser',
  paperWidth: 80,
  autoPrint: false,
  showPreview: true,
};

export const DEFAULT_STORE_INFO = {
  storeName: 'CAFE CANVA',
  storeAddress: '123 Main Street, Mumbai 400001',
  storePhone: '+91 98765 43210',
  gstNumber: '27AABCU9603R1ZM',
  fssaiNumber: '11521999000123',
  footerMessage: 'Thank you for visiting! See you again soon ☕',
};

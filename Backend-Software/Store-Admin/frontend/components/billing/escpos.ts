/**
 * ESC/POS Thermal Printer Utility
 * 
 * Generates raw ESC/POS byte commands for direct USB thermal printer output.
 * Supports: text formatting, alignment, line feed, cut paper, and basic styling.
 */

export class ESCPOSPrinter {
  private buffer: number[] = [];

  // ─── ESC/POS Constants ───
  private ESC = 0x1b;
  private GS = 0x1d;
  private LF = 0x0a;

  constructor() {
    this.init();
  }

  /** Initialize printer */
  init(): this {
    this.buffer.push(this.ESC, 0x40); // ESC @ — Initialize
    return this;
  }

  /** Print text */
  text(str: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    this.buffer.push(this.LF);
    return this;
  }

  /** Print text without line feed */
  textInline(str: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  /** Feed N lines */
  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(this.LF);
    }
    return this;
  }

  /** Set bold mode */
  bold(on: boolean): this {
    this.buffer.push(this.ESC, 0x45, on ? 1 : 0); // ESC E n
    return this;
  }

  /** Set underline */
  underline(on: boolean): this {
    this.buffer.push(this.ESC, 0x2d, on ? 1 : 0); // ESC - n
    return this;
  }

  /** Set double height/width */
  doubleSize(on: boolean): this {
    this.buffer.push(this.ESC, 0x21, on ? 0x30 : 0x00); // ESC ! n
    return this;
  }

  /** Set font size (0=normal, 1=double width, 2=double height, 3=both) */
  setFontSize(size: 0 | 1 | 2 | 3): this {
    const map: Record<number, number> = { 0: 0x00, 1: 0x10, 2: 0x20, 3: 0x30 };
    this.buffer.push(this.ESC, 0x21, map[size] ?? 0x00);
    return this;
  }

  /** Align text */
  alignLeft(): this {
    this.buffer.push(this.ESC, 0x61, 0); // ESC a 0
    return this;
  }

  alignCenter(): this {
    this.buffer.push(this.ESC, 0x61, 1); // ESC a 1
    return this;
  }

  alignRight(): this {
    this.buffer.push(this.ESC, 0x61, 2); // ESC a 2
    return this;
  }

  /** Print a horizontal line separator */
  separator(char: string = '-', width: number = 32): this {
    this.text(char.repeat(width));
    return this;
  }

  /** Print a row with left and right aligned text */
  row(left: string, right: string, width: number = 32): this {
    const spaces = width - left.length - right.length;
    const padding = spaces > 0 ? ' '.repeat(spaces) : ' ';
    this.text(`${left}${padding}${right}`);
    return this;
  }

  /** Print a three-column row */
  row3(left: string, center: string, right: string, width: number = 32): this {
    const leftW = Math.floor(width * 0.45);
    const centerW = Math.floor(width * 0.15);
    const rightW = width - leftW - centerW;
    const l = left.substring(0, leftW).padEnd(leftW);
    const c = center.substring(0, centerW).padStart(centerW);
    const r = right.substring(0, rightW).padStart(rightW);
    this.text(`${l}${c}${r}`);
    return this;
  }

  /** Cut paper */
  cut(): this {
    this.feed(3);
    this.buffer.push(this.GS, 0x56, 0x00); // GS V 0 — Full cut
    return this;
  }

  /** Partial cut */
  partialCut(): this {
    this.feed(3);
    this.buffer.push(this.GS, 0x56, 0x01); // GS V 1 — Partial cut
    return this;
  }

  /** Open cash drawer */
  openCashDrawer(): this {
    this.buffer.push(this.ESC, 0x70, 0x00, 0x19, 0xfa); // ESC p 0 25 250
    return this;
  }

  /** Get the complete byte buffer */
  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /** Clear the buffer */
  clear(): this {
    this.buffer = [];
    return this;
  }
}

/**
 * Build a full receipt in ESC/POS format from ReceiptData
 */
export function buildReceiptESCPOS(data: {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  gstNumber: string;
  billId: string;
  tableName: string;
  dateTime: string;
  items: { name: string; qty: number; price: number; total: number }[];
  subtotal: number;
  gstAmount: number;
  gstPercent: number;
  serviceCharge: number;
  servicePercent: number;
  discountAmount: number;
  discountPercent: number;
  grandTotal: number;
  paymentMethod: string;
  cashReceived?: number;
  changeDue?: number;
  footerMessage: string;
}, paperWidth: 58 | 80 = 80): Uint8Array {
  const w = paperWidth === 58 ? 32 : 48; // characters per line
  const p = new ESCPOSPrinter();

  // Header
  p.alignCenter();
  p.doubleSize(true);
  p.text(data.storeName);
  p.doubleSize(false);
  p.text(data.storeAddress);
  p.text(`Ph: ${data.storePhone}`);
  if (data.gstNumber) p.text(`GSTIN: ${data.gstNumber}`);
  p.feed(1);

  // Bill Info
  p.alignLeft();
  p.separator('=', w);
  p.row('Bill: ' + data.billId, data.tableName, w);
  p.text(data.dateTime);
  p.separator('=', w);

  // Items Header
  p.bold(true);
  p.row3('Item', 'Qty', 'Amount', w);
  p.bold(false);
  p.separator('-', w);

  // Items
  for (const item of data.items) {
    const name = item.name.length > Math.floor(w * 0.45)
      ? item.name.substring(0, Math.floor(w * 0.45) - 1) + '…'
      : item.name;
    p.row3(name, `x${item.qty}`, `₹${item.total}`, w);
  }

  p.separator('-', w);

  // Totals
  p.row('Subtotal', `₹${data.subtotal}`, w);
  if (data.gstAmount > 0) p.row(`GST (${data.gstPercent}%)`, `₹${data.gstAmount}`, w);
  if (data.serviceCharge > 0) p.row(`Service (${data.servicePercent}%)`, `₹${data.serviceCharge}`, w);
  if (data.discountAmount > 0) p.row(`Discount (${data.discountPercent}%)`, `-₹${data.discountAmount}`, w);

  p.separator('=', w);

  // Grand Total
  p.bold(true);
  p.doubleSize(true);
  p.row('TOTAL', `₹${data.grandTotal}`, Math.floor(w / 2));
  p.doubleSize(false);
  p.bold(false);

  p.separator('=', w);

  // Payment
  p.row('Payment', data.paymentMethod.toUpperCase(), w);
  if (data.cashReceived && data.cashReceived > 0) {
    p.row('Cash Received', `₹${data.cashReceived}`, w);
    p.row('Change Due', `₹${data.changeDue || 0}`, w);
  }

  p.separator('-', w);

  // Footer
  p.feed(1);
  p.alignCenter();
  p.text(data.footerMessage);
  p.feed(1);
  p.text('Powered by CafeCanva');

  p.cut();
  p.openCashDrawer();

  return p.getBytes();
}

/**
 * Send bytes to a USB printer via Web USB API (Chrome only)
 */
export async function printViaWebUSB(bytes: Uint8Array): Promise<boolean> {
  try {
    if (!('usb' in navigator)) {
      throw new Error('Web USB API not supported in this browser. Use Chrome.');
    }

    // Request USB device (thermal printer)
    const device = await (navigator as any).usb.requestDevice({
      filters: [
        { vendorId: 0x04b8 }, // Epson
        { vendorId: 0x0519 }, // Star Micronics
        { vendorId: 0x0dd4 }, // Bixolon
        { vendorId: 0x0fe6 }, // TVS
        { vendorId: 0x1fc9 }, // Generic POS
      ],
    });

    await device.open();

    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    const iface = device.configuration.interfaces[0];
    await device.claimInterface(iface.interfaceNumber);

    // Find the OUT endpoint
    const endpoint = iface.alternate.endpoints.find(
      (ep: any) => ep.direction === 'out'
    );

    if (!endpoint) {
      throw new Error('No OUT endpoint found on the printer.');
    }

    await device.transferOut(endpoint.endpointNumber, bytes);
    await device.close();

    return true;
  } catch (err) {
    console.error('Web USB print error:', err);
    return false;
  }
}

/**
 * Send bytes to a USB printer via Web Serial API (Chrome only)
 */
export async function printViaWebSerial(bytes: Uint8Array): Promise<boolean> {
  try {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API not supported in this browser. Use Chrome.');
    }

    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate: 9600 });

    const writer = port.writable.getWriter();
    await writer.write(bytes);
    writer.releaseLock();

    await port.close();
    return true;
  } catch (err) {
    console.error('Web Serial print error:', err);
    return false;
  }
}

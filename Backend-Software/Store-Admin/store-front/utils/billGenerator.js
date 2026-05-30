/**
 * Bill Generator Utilities
 * Formats bill data and generates printable/downloadable receipts.
 */

/** Format bill data into structured receipt object */
export function formatBill(orderData) {
  const now = new Date();
  return {
    orderId: orderData.orderId || `ORD-${Date.now().toString().slice(-6)}`,
    orderNumber: orderData.orderId?.replace(/\D/g, "").slice(-4) || Math.floor(1000 + Math.random() * 9000),
    timestamp: now.toISOString(),
    formattedDate: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    formattedTime: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    store: {
      name: "Cafe Canvas",
      address: "123 Artisan Lane, Koramangala, Bangalore 560034",
      phone: "+91 98765 43210",
      gstin: "29ABCDE1234F1Z5",
    },
    customer: {
      name: orderData.customerName || "Guest",
      phone: orderData.customerPhone || "",
      orderType: orderData.orderType || "dine_in",
      tableNumber: orderData.tableNumber || "",
    },
    items: (orderData.items || []).map((item) => ({
      name: item.name,
      qty: item.quantity || item.qty || 1,
      unitPrice: item.price,
      total: item.price * (item.quantity || item.qty || 1),
      customisation: item.customisation || null,
      modifiers: item.modifiers || [],
    })),
    subtotal: orderData.subtotal || 0,
    cgst: orderData.cgst || 0,
    sgst: orderData.sgst || 0,
    serviceCharge: orderData.serviceCharge || 0,
    discount: orderData.discount || 0,
    total: orderData.total || 0,
    paymentMethod: orderData.paymentMethod || "razorpay",
    paymentId: orderData.paymentId || "",
  };
}

/** Generate printable HTML string for receipt */
export function generateReceiptHTML(bill) {
  const itemRows = bill.items
    .map((item) => {
      let row = `<tr><td>${item.name}</td><td style="text-align:center">x${item.qty}</td><td style="text-align:right">₹${item.total}</td></tr>`;
      if (item.customisation?.excludedIngredients?.length) {
        row += `<tr><td colspan="3" style="font-size:11px;color:#78716C;padding-left:12px">  - No ${item.customisation.excludedIngredients.join(", ")}</td></tr>`;
      }
      if (item.modifiers?.length) {
        row += `<tr><td colspan="3" style="font-size:11px;color:#78716C;padding-left:12px">  + ${item.modifiers.map((m) => m.name).join(", ")}</td></tr>`;
      }
      return row;
    })
    .join("");

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; width: 80mm; margin: 0 auto; padding: 16px; color: #1C1917; }
  h2 { text-align: center; margin: 0; font-size: 16px; }
  .center { text-align: center; }
  .divider { border-top: 1px dashed #E7E5E4; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 2px 0; }
  .total-row { font-weight: 700; font-size: 15px; }
  .muted { color: #78716C; font-size: 11px; }
</style></head><body>
  <div class="center"><h2>${bill.store.name}</h2>
  <p class="muted">${bill.store.address}<br>${bill.store.phone}</p>
  <p class="muted">GSTIN: ${bill.store.gstin}</p></div>
  <div class="divider"></div>
  <p>Order: #${bill.orderNumber} · ${bill.formattedDate} ${bill.formattedTime}</p>
  <p>Customer: ${bill.customer.name}<br>
  ${bill.customer.orderType === "dine_in" ? `Dine In · Table ${bill.customer.tableNumber}` : bill.customer.orderType === "takeaway" ? "Takeaway" : "Delivery"}</p>
  <div class="divider"></div>
  <table><thead><tr><td><strong>ITEM</strong></td><td style="text-align:center"><strong>QTY</strong></td><td style="text-align:right"><strong>PRICE</strong></td></tr></thead>
  <tbody>${itemRows}</tbody></table>
  <div class="divider"></div>
  <table>
    <tr><td>Subtotal</td><td style="text-align:right">₹${bill.subtotal}</td></tr>
    ${bill.cgst ? `<tr><td class="muted">CGST (2.5%)</td><td style="text-align:right" class="muted">₹${bill.cgst}</td></tr>` : ""}
    ${bill.sgst ? `<tr><td class="muted">SGST (2.5%)</td><td style="text-align:right" class="muted">₹${bill.sgst}</td></tr>` : ""}
    ${bill.serviceCharge ? `<tr><td class="muted">Service Charge</td><td style="text-align:right" class="muted">₹${bill.serviceCharge}</td></tr>` : ""}
    ${bill.discount ? `<tr><td style="color:#16A34A">Discount</td><td style="text-align:right;color:#16A34A">-₹${bill.discount}</td></tr>` : ""}
  </table>
  <div class="divider"></div>
  <table><tr class="total-row"><td>TOTAL PAID</td><td style="text-align:right">₹${bill.total}</td></tr></table>
  <p class="muted">Payment: ${bill.paymentMethod.toUpperCase()} ✓<br>ID: ${bill.paymentId}</p>
  <div class="divider"></div>
  <p class="center">Thank you for dining with us! 🍳<br><span class="muted">Visit again soon</span></p>
</body></html>`;
}

/** Trigger print of receipt */
export function printReceipt(bill) {
  const html = generateReceiptHTML(bill);
  const win = window.open("", "_blank", "width=320,height=600");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  }
}

/** Download receipt as text file (lightweight alternative to PDF) */
export function downloadReceipt(bill) {
  const lines = [
    `${"═".repeat(40)}`,
    `  ${bill.store.name}`,
    `  ${bill.store.address}`,
    `  ${bill.store.phone}`,
    `${"─".repeat(40)}`,
    `  Order #${bill.orderNumber}  ·  ${bill.formattedDate} ${bill.formattedTime}`,
    `  Customer: ${bill.customer.name}`,
    `  ${bill.customer.orderType === "dine_in" ? `Dine In · Table ${bill.customer.tableNumber}` : bill.customer.orderType}`,
    `${"─".repeat(40)}`,
    ...bill.items.map((i) => `  ${i.name.padEnd(22)} x${i.qty}   ₹${i.total}`),
    `${"─".repeat(40)}`,
    `  Subtotal${" ".repeat(22)}₹${bill.subtotal}`,
    ...(bill.cgst ? [`  CGST (2.5%)${" ".repeat(19)}₹${bill.cgst}`] : []),
    ...(bill.sgst ? [`  SGST (2.5%)${" ".repeat(19)}₹${bill.sgst}`] : []),
    ...(bill.discount ? [`  Discount${" ".repeat(21)}-₹${bill.discount}`] : []),
    `${"═".repeat(40)}`,
    `  TOTAL PAID${" ".repeat(20)}₹${bill.total}`,
    `${"═".repeat(40)}`,
    `  Payment: ${bill.paymentMethod} ✓`,
    `  ID: ${bill.paymentId}`,
    ``,
    `  Thank you for dining with us! 🍳`,
  ];
  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CafeCanvas-Receipt-${bill.orderNumber}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

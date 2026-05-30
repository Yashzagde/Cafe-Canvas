"use client";

import { motion } from "framer-motion";
import { Printer, Download, Share2, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import { formatPrice } from "@/utils/api";
import { printReceipt, downloadReceipt } from "@/utils/billGenerator";

export default function BillReceipt({ bill, onOrderAgain }) {
  if (!bill) return null;

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const handleShareWhatsApp = () => {
    const text = `Order Confirmation from Cafe Canvas!\nOrder ID: #${bill.orderId}\nTotal: ${formatPrice(bill.total)}\nTable: ${bill.customer.tableNumber || "N/A"}\nStatus: Paid ✓`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 max-w-md mx-auto print:py-0">
      {/* Visual Paid Indicator banner */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="text-center mb-6 print:hidden"
      >
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-100">
          <CheckCircle2 className="w-9 h-9 text-emerald-500" />
        </div>
        <h2 className="font-display font-extrabold text-xl text-surface-900 leading-tight">Order Confirmed!</h2>
        <p className="text-xs text-surface-500 mt-1">Your payment was processed and receipt was generated.</p>
      </motion.div>

      {/* Jagged Edge Thermal Receipt Box */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="print-receipt w-full bg-[#FAFAF7] text-[#1C1917] p-6 shadow-[0_8px_30px_rgba(28,25,23,0.06)] border border-[#E7E5E4] font-mono text-xs rounded-xl relative overflow-hidden"
      >
        {/* Jagged tear-off line overlay */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-repeat-x flex" style={{ backgroundImage: "linear-gradient(45deg, transparent 33.333%, #E7E5E4 33.333%, #E7E5E4 66.666%, transparent 66.666%), linear-gradient(-45deg, transparent 33.333%, #E7E5E4 33.333%, #E7E5E4 66.666%, transparent 66.666%)", backgroundSize: "6px 12px", transform: "translateY(-6px)" }}></div>

        {/* Store Title details */}
        <motion.div variants={itemVariants} className="text-center pb-4">
          <h3 className="text-base font-extrabold tracking-wide uppercase leading-tight">{bill.store.name}</h3>
          <p className="text-[10px] text-surface-500 leading-tight mt-1">
            {bill.store.address}
            <br />
            Phone: {bill.store.phone}
          </p>
          <p className="text-[9px] text-surface-400 mt-0.5">GSTIN: {bill.store.gstin}</p>
        </motion.div>

        {/* Receipt divider */}
        <motion.div variants={itemVariants} className="border-t border-dashed border-[#E7E5E4] my-3" />

        {/* Customer / Order metadata */}
        <motion.div variants={itemVariants} className="space-y-1 text-[11px] leading-tight">
          <div className="flex justify-between">
            <span className="text-surface-500">Order Ref:</span>
            <span className="font-bold">#{bill.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Date:</span>
            <span>{bill.formattedDate} · {bill.formattedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Customer:</span>
            <span className="font-bold truncate max-w-[180px]">{bill.customer.name}</span>
          </div>
          {bill.customer.phone && (
            <div className="flex justify-between">
              <span className="text-surface-500">Phone:</span>
              <span>{bill.customer.phone}</span>
            </div>
          )}
          <div className="flex justify-between items-center bg-surface-150/40 px-1.5 py-0.5 rounded mt-1">
            <span className="text-surface-500 font-bold uppercase text-[9px]">Serving mode:</span>
            <span className="font-bold uppercase text-[9px] text-[var(--color-terracotta)]">
              {bill.customer.orderType === "dine_in"
                ? `DINE-IN (TABLE ${bill.customer.tableNumber || "N/A"})`
                : bill.customer.orderType === "takeaway"
                ? "TAKEAWAY"
                : "DELIVERY"}
            </span>
          </div>
        </motion.div>

        {/* Receipt divider */}
        <motion.div variants={itemVariants} className="border-t border-dashed border-[#E7E5E4] my-3" />

        {/* Items Table Headers */}
        <motion.div variants={itemVariants} className="grid grid-cols-5 font-bold pb-1 text-surface-500 text-[10px]">
          <span className="col-span-3">ITEM DESCRIPTION</span>
          <span className="text-center">QTY</span>
          <span className="text-right">PRICE</span>
        </motion.div>

        <motion.div variants={itemVariants} className="border-b border-dashed border-[#E7E5E4] mb-2" />

        {/* Items List Rows */}
        <motion.div variants={itemVariants} className="space-y-2.5">
          {bill.items.map((i, idx) => (
            <div key={idx} className="flex flex-col text-[11px] leading-tight">
              <div className="grid grid-cols-5">
                <span className="col-span-3 font-bold truncate pr-2">{i.name}</span>
                <span className="text-center text-surface-500">x{i.qty}</span>
                <span className="text-right font-bold">{formatPrice(i.total)}</span>
              </div>

              {/* Extras indicators */}
              {i.customisation?.addOns?.length > 0 && (
                <div className="text-[10px] text-surface-500 pl-3 space-y-0.5 mt-0.5 italic">
                  {i.customisation.addOns.map((addon, aIdx) => (
                    <div key={aIdx} className="flex justify-between">
                      <span>+ {addon.name}</span>
                      <span>{formatPrice(addon.price)}</span>
                    </div>
                  ))}
                </div>
              )}
              {i.customisation?.specialInstructions && (
                <div className="text-[10px] text-surface-450 pl-3 mt-0.5 italic">
                  * Note: &ldquo;{i.customisation.specialInstructions}&rdquo;
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Receipt divider */}
        <motion.div variants={itemVariants} className="border-t border-dashed border-[#E7E5E4] my-3" />

        {/* Tax breakdown summary */}
        <motion.div variants={itemVariants} className="space-y-1.5 text-[11px] text-surface-650">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(bill.subtotal)}</span>
          </div>

          {bill.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Coupon Discount</span>
              <span>-{formatPrice(bill.discount)}</span>
            </div>
          )}

          {bill.cgst > 0 && (
            <div className="flex justify-between text-[10px]">
              <span>CGST</span>
              <span>{formatPrice(bill.cgst)}</span>
            </div>
          )}

          {bill.sgst > 0 && (
            <div className="flex justify-between text-[10px]">
              <span>SGST</span>
              <span>{formatPrice(bill.sgst)}</span>
            </div>
          )}

          {bill.serviceCharge > 0 && (
            <div className="flex justify-between text-[10px]">
              <span>Service Charge</span>
              <span>{formatPrice(bill.serviceCharge)}</span>
            </div>
          )}
        </motion.div>

        {/* Receipt divider */}
        <motion.div variants={itemVariants} className="border-t border-double border-[#E7E5E4] my-3" />

        {/* Total Payable Row */}
        <motion.div variants={itemVariants} className="flex justify-between items-baseline font-bold text-sm">
          <span>TOTAL PAID</span>
          <span className="text-base font-extrabold text-[var(--color-terracotta)]">{formatPrice(bill.total)}</span>
        </motion.div>

        {/* Receipt divider */}
        <motion.div variants={itemVariants} className="border-t border-dashed border-[#E7E5E4] my-3" />

        {/* Payment confirmation details */}
        <motion.div variants={itemVariants} className="text-[10px] text-surface-500 leading-tight space-y-0.5">
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <span className="text-emerald-600 font-bold">SUCCESSFUL ✓</span>
          </div>
          <div className="flex justify-between">
            <span>Method:</span>
            <span className="font-bold uppercase">{bill.paymentMethod}</span>
          </div>
          {bill.paymentId && (
            <div className="flex justify-between">
              <span>Txn Ref:</span>
              <span className="truncate max-w-[160px]">{bill.paymentId}</span>
            </div>
          )}
        </motion.div>

        {/* Receipt divider */}
        <motion.div variants={itemVariants} className="border-t border-dashed border-[#E7E5E4] my-3" />

        {/* Footer friendly message */}
        <motion.div variants={itemVariants} className="text-center pt-2 pb-1">
          <p className="text-[11px] font-bold">Made with Love at Cafe Canvas! 🍳</p>
          <p className="text-[9px] text-surface-400 mt-1 italic">Please show this screen at the counter if dining in.</p>
        </motion.div>

        {/* Jagged bottom tear-off line overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-repeat-x flex" style={{ backgroundImage: "linear-gradient(45deg, transparent 33.333%, #E7E5E4 33.333%, #E7E5E4 66.666%, transparent 66.666%), linear-gradient(-45deg, transparent 33.333%, #E7E5E4 33.333%, #E7E5E4 66.666%, transparent 66.666%)", backgroundSize: "6px 12px", transform: "translateY(6px)" }}></div>
      </motion.div>

      {/* Action Buttons Row */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-2.5 w-full mt-6 print:hidden"
      >
        <div className="grid grid-cols-3 gap-2">
          {/* Print Button */}
          <button
            onClick={() => printReceipt(bill)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-surface-200 text-surface-700 text-[10px] font-bold shadow-sm hover:bg-surface-50 active:scale-95 transition-all gap-1.5"
          >
            <Printer className="w-4 h-4 text-surface-500" />
            Print
          </button>

          {/* Download Text Receipt Button */}
          <button
            onClick={() => downloadReceipt(bill)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-surface-200 text-surface-700 text-[10px] font-bold shadow-sm hover:bg-surface-50 active:scale-95 transition-all gap-1.5"
          >
            <Download className="w-4 h-4 text-surface-500" />
            Download
          </button>

          {/* Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-surface-200 text-surface-700 text-[10px] font-bold shadow-sm hover:bg-surface-50 active:scale-95 transition-all gap-1.5"
          >
            <Share2 className="w-4 h-4 text-surface-500" />
            Share
          </button>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={onOrderAgain}
          className="w-full btn btn-primary flex items-center justify-center gap-2 mt-2 h-12 text-sm bg-[#1C1917] hover:bg-[var(--color-terracotta)] text-white font-extrabold rounded-full shadow transition-all active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          Order Something Else
        </button>
      </motion.div>
    </div>
  );
}

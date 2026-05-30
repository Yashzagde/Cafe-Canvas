"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Minus, Plus, Trash2, ShoppingBag,
  CreditCard, Banknote, Tag, ChevronRight, AlertCircle, Sparkles, User, Phone, MapPin, Coffee
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import useCartStore from "@/stores/cartStore";
import useOrderStore from "@/stores/orderStore";
import BillReceipt from "@/components/cart/BillReceipt";
import { formatPrice } from "@/utils/api";
import { formatBill } from "@/utils/billGenerator";
import { loadRazorpayScript, createOrder, openCheckout, verifyPayment } from "@/utils/razorpay";
import Toast from "@/components/ui/Toast";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeAtIndex = useCartStore((s) => s.removeAtIndex);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  // States
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Review, 2: Checkout Form, 3: Bill Receipt
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState("");
  
  // Checkout Form Details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("dine_in"); // dine_in, takeaway, delivery
  const [tableNumber, setTableNumber] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online"); // online, counter
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  // Dynamic Billing Settings from localStorage (matching Admin Settings-Billing key)
  const [billingSettings, setBillingSettings] = useState({
    cgstPercent: 2.5,
    sgstPercent: 2.5,
    serviceChargeType: "percent",
    serviceChargeValue: 5,
  });

  const [finalBill, setFinalBill] = useState(null);

  // Load customizable billing settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cafe_canva_billing_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            setBillingSettings({
              cgstPercent: parsed.cgstPercent !== undefined ? parsed.cgstPercent : 2.5,
              sgstPercent: parsed.sgstPercent !== undefined ? parsed.sgstPercent : 2.5,
              serviceChargeType: parsed.serviceChargeType || "percent",
              serviceChargeValue: parsed.serviceChargeValue !== undefined ? parsed.serviceChargeValue : 5,
            });
          }
        } catch (e) {
          console.error("Error loading billing settings:", e);
        }
      }
    }
  }, []);

  const subtotal = getSubtotal();
  const cartCount = getItemCount();

  // Price calculations
  const discountAmount = couponApplied ? Math.round(subtotal * (couponApplied.discount / 100)) : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const cgst = Math.round(taxableAmount * (billingSettings.cgstPercent / 100));
  const sgst = Math.round(taxableAmount * (billingSettings.sgstPercent / 100));
  
  const serviceCharge = billingSettings.serviceChargeType === "flat"
    ? billingSettings.serviceChargeValue
    : Math.round(taxableAmount * (billingSettings.serviceChargeValue / 100));

  const total = taxableAmount + cgst + sgst + serviceCharge;

  const handleApplyCoupon = () => {
    setCouponError("");
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === "CAFE10" || couponCode.toUpperCase() === "WELCOME") {
      setCouponApplied({ code: couponCode.toUpperCase(), discount: 10 });
      setToast({ message: "Coupon applied! 10% discount added.", type: "success" });
    } else if (couponCode.toUpperCase() === "SUPERBIRD") {
      setCouponApplied({ code: "SUPERBIRD", discount: 20 });
      setToast({ message: "Superbird coupon applied! 20% discount added.", type: "success" });
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
  };

  const handleNextStep = () => {
    if (checkoutStep === 1) {
      setCheckoutStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setToast({ message: "Please enter your name", type: "error" });
      return;
    }
    if (orderType === "dine_in" && !tableNumber.trim()) {
      setToast({ message: "Please select a table number", type: "error" });
      return;
    }

    setProcessing(true);

    const orderData = {
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      customerName,
      customerPhone,
      orderType,
      tableNumber: orderType === "dine_in" ? tableNumber : "",
      items,
      subtotal,
      cgst,
      sgst,
      serviceCharge,
      discount: discountAmount,
      total,
      paymentMethod,
    };

    if (paymentMethod === "online") {
      try {
        // Step A: Load Razorpay script
        setToast({ message: "Connecting to secure payment gateway...", type: "info" });
        await loadRazorpayScript();

        // Step B: Create order on simulated gateway
        const ord = await createOrder({ total }, orderData);

        // Step C: Open checkout payment window
        const options = {
          ...ord,
          logo: "",
          storeName: "Cafe Canvas",
          orderId: orderData.orderId,
          customerName,
          customerPhone,
        };

        const res = await openCheckout(options);

        // Step D: Verify payment
        const verification = await verifyPayment({
          ...res,
          orderId: orderData.orderId,
          customerName,
          customerPhone,
          orderType,
          tableNumber: orderType === "dine_in" ? tableNumber : "",
          items,
          subtotal,
          tax: cgst + sgst,
          serviceCharge,
          discount: discountAmount,
          total,
        });

        if (verification.success) {
          const generated = formatBill(orderData);
          generated.paymentId = verification.billData.paymentId;
          setFinalBill(generated);
          setToast({ message: "Payment verified successfully!", type: "success" });
          clearCart();
          setCheckoutStep(3);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (err) {
        console.error(err);
        setToast({ message: err.message || "Payment session closed.", type: "error" });
      } finally {
        setProcessing(false);
      }
    } else {
      // Direct Cash/Counter payment flow
      setTimeout(() => {
        const generated = formatBill({
          ...orderData,
          paymentId: `CASH-${Date.now().toString().slice(-4)}`,
          paymentMethod: "counter",
        });
        setFinalBill(generated);
        setToast({ message: "Order placed! Please pay at the counter.", type: "success" });
        clearCart();
        setCheckoutStep(3);
        setProcessing(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1500);
    }
  };

  const handleOrderAgain = () => {
    setCheckoutStep(1);
    setFinalBill(null);
    setCustomerName("");
    setCustomerPhone("");
    setTableNumber("");
    setAddress("");
  };

  // Step 3: Receipt OS viewport
  if (checkoutStep === 3) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-12 min-h-screen bg-surface-50 flex items-center justify-center">
          <BillReceipt bill={finalBill} onOrderAgain={handleOrderAgain} />
        </main>
        <Footer />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  // Empty cart display
  if (items.length === 0 && checkoutStep === 1) {
    return (
      <>
        <Navbar />
        <main className="pt-24 min-h-screen bg-surface-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-sm p-6 bg-white rounded-3xl border border-surface-100 shadow-sm"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-surface-150 flex items-center justify-center mb-5">
              <ShoppingBag className="w-9 h-9 text-surface-400" />
            </div>
            <h2 className="font-display font-extrabold text-xl text-surface-900">Your basket is empty</h2>
            <p className="text-xs text-surface-450 mt-2">
              Browse our handcrafted, organic recipes and add some seasonal drinks to your list!
            </p>
            <Link href="/items" className="btn btn-primary mt-6 w-full" id="cart-browse-menu">
              Browse Our Menu
            </Link>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-surface-50">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Header flow indicator */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {checkoutStep === 2 && (
                <button
                  onClick={() => setCheckoutStep(1)}
                  className="w-9 h-9 rounded-full bg-white border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-50 transition-all active:scale-95"
                  id="checkout-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <h1 className="font-display font-extrabold text-xl sm:text-2xl text-surface-900">
                  {checkoutStep === 1 ? "Your Order List" : "Delivery Details"}
                </h1>
                <p className="text-xs text-surface-450">
                  {checkoutStep === 1 ? `${cartCount} item(s) selected` : "Secure order authentication"}
                </p>
              </div>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-1">
              <span className={`h-2 rounded-full transition-all duration-300 ${checkoutStep === 1 ? "w-6 bg-[var(--color-terracotta)]" : "w-2 bg-surface-200"}`} />
              <span className={`h-2 rounded-full transition-all duration-300 ${checkoutStep === 2 ? "w-6 bg-[var(--color-terracotta)]" : "w-2 bg-surface-200"}`} />
              <span className={`h-2 rounded-full w-2 bg-surface-200`} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* STEP 1: REVIEW BASKET ITEMS */}
            {checkoutStep === 1 ? (
              <div className="lg:col-span-3 space-y-3">
                <AnimatePresence>
                  {items.map((item, index) => {
                    const modifiersCost = (item.modifiers || []).reduce((ms, m) => ms + (m.extraPrice || 0), 0);
                    const singlePrice = item.price + modifiersCost;
                    const itemsPrice = singlePrice * item.quantity;
                    return (
                      <motion.div
                        key={`${item.id}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl p-4 border border-surface-100 shadow-[0_4px_12px_rgba(28,25,23,0.02)] flex gap-4"
                        id={`cart-item-${index}`}
                      >
                        {/* Image / Icon container */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-50 to-surface-150 flex items-center justify-center overflow-hidden shrink-0 border border-surface-100">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl opacity-30">☕</span>
                          )}
                        </div>

                        {/* Details contents */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-sm text-surface-900 truncate pr-1">{item.name}</h4>
                              <button
                                onClick={() => removeAtIndex(index)}
                                className="text-surface-400 hover:text-red-500 transition-colors"
                                id={`cart-delete-${index}`}
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Modifiers List summary */}
                            {item.modifiers?.length > 0 && (
                              <p className="text-[10px] text-surface-450 font-bold uppercase tracking-wider mt-0.5">
                                {item.modifiers.map((m) => m.name.replace("Size: ", "")).join(" · ")}
                              </p>
                            )}

                            {/* Special Instructions display */}
                            {item.customisation?.specialInstructions && (
                              <p className="text-[10px] text-[var(--color-terracotta)] font-bold italic mt-0.5">
                                Note: &ldquo;{item.customisation.specialInstructions}&rdquo;
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-50">
                            <span className="font-display font-extrabold text-sm text-[var(--color-terracotta)]">
                              {formatPrice(itemsPrice)}
                            </span>

                            {/* Custom Quantity Stepper */}
                            <div className="flex items-center bg-surface-100 rounded-full border border-surface-200 p-0.5">
                              <button
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                className="w-6.5 h-6.5 rounded-full flex items-center justify-center text-surface-600 hover:bg-white transition-colors"
                                id={`cart-minus-${index}`}
                              >
                                {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                              </button>
                              <span className="w-5 text-center text-xs font-extrabold text-surface-850">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                className="w-6.5 h-6.5 rounded-full flex items-center justify-center text-surface-600 hover:bg-white transition-colors"
                                id={`cart-plus-${index}`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              
              /* STEP 2: DETAILS & CHECKOUT FORM */
              <div className="lg:col-span-3">
                <form onSubmit={handlePlaceOrder} className="bg-white rounded-[32px] p-6 border border-surface-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-surface-100">
                    <Sparkles className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                    <h3 className="font-display font-bold text-sm text-surface-900">Personal Authentication</h3>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-surface-450 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-2xl text-xs text-surface-850 focus:outline-none focus:border-[var(--color-terracotta)] focus:ring-1 focus:ring-[var(--color-terracotta)] transition-all"
                      id="checkout-name"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-surface-450 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-2xl text-xs text-surface-850 focus:outline-none focus:border-[var(--color-terracotta)] focus:ring-1 focus:ring-[var(--color-terracotta)] transition-all"
                      id="checkout-phone"
                    />
                  </div>

                  {/* Serving Mode (Dine-in/Takeaway/Delivery) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-surface-450 uppercase tracking-wider">Serving Mode</span>
                    <div className="grid grid-cols-3 gap-2">
                      {["dine_in", "takeaway", "delivery"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setOrderType(type)}
                          className={`py-3 px-1 rounded-2xl border text-[10px] font-extrabold uppercase transition-all text-center ${
                            orderType === type
                              ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)]/5 text-[var(--color-terracotta)] shadow-sm"
                              : "border-surface-200 text-surface-600 bg-white hover:border-surface-300"
                          }`}
                        >
                          {type.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Serving inputs (Table number or delivery address) */}
                  {orderType === "dine_in" && (
                    <div className="space-y-1 animate-slide-up">
                      <label className="text-[10px] font-bold text-surface-450 uppercase tracking-wider">Table Number</label>
                      <select
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-2xl text-xs text-surface-850 focus:outline-none focus:border-[var(--color-terracotta)] focus:ring-1 focus:ring-[var(--color-terracotta)] transition-all"
                        id="checkout-table"
                      >
                        <option value="">-- Choose Your Table --</option>
                        {Array.from({ length: 15 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>Table {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {orderType === "delivery" && (
                    <div className="space-y-1 animate-slide-up">
                      <label className="text-[10px] font-bold text-surface-450 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Delivery Address
                      </label>
                      <textarea
                        required
                        placeholder="Please enter your complete address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full h-20 p-3 bg-surface-50 border border-surface-200 rounded-2xl text-xs text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-[var(--color-terracotta)] focus:ring-1 focus:ring-[var(--color-terracotta)] transition-all resize-none"
                        id="checkout-address"
                      />
                    </div>
                  )}

                  {/* Payment Methods */}
                  <div className="pt-3 border-t border-surface-50 space-y-2">
                    <span className="text-[10px] font-bold text-surface-450 uppercase tracking-wider">Payment Settlement</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border text-xs font-bold transition-all ${
                          paymentMethod === "online"
                            ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)]/5 text-[var(--color-terracotta)] shadow-sm"
                            : "border-surface-200 text-surface-600 bg-white hover:border-surface-300"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        Settlement Online
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("counter")}
                        className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border text-xs font-bold transition-all ${
                          paymentMethod === "counter"
                            ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)]/5 text-[var(--color-terracotta)] shadow-sm"
                            : "border-surface-200 text-surface-600 bg-white hover:border-surface-300"
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                        Pay at Counter
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* SIDEBAR BILL SUMMARY (Sticky Panel) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[32px] p-6 border border-surface-100 shadow-[0_10px_30px_rgba(28,25,23,0.03)] sticky top-24 space-y-5">
                <h3 className="font-display font-bold text-sm text-surface-900 border-b border-surface-100 pb-3">Bill Summary</h3>

                {/* Promo Code Input */}
                {checkoutStep === 1 && (
                  <div className="space-y-1.5">
                    {couponApplied ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                          <Tag className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{couponApplied.code} Applied ({couponApplied.discount}% off)</span>
                        </div>
                        <button onClick={handleRemoveCoupon} className="text-emerald-600 font-bold hover:underline">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Promo Code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            id="coupon-input"
                            className="flex-1 px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-2xl text-xs text-surface-850 focus:outline-none focus:border-[var(--color-terracotta)] focus:ring-1 focus:ring-[var(--color-terracotta)]"
                          />
                          <button onClick={handleApplyCoupon} type="button" className="btn btn-secondary btn-sm h-auto" id="apply-coupon">
                            Apply
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {couponError}
                          </p>
                        )}
                        <p className="text-[9px] text-surface-400 mt-1.5">Try coupon codes: <span className="font-bold">WELCOME</span> or <span className="font-bold">CAFE10</span></p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing Details Breakdown */}
                <div className="space-y-2 text-xs text-surface-650 border-t border-surface-50 pt-4">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[11px] text-surface-450">
                    <span>CGST ({billingSettings.cgstPercent}%)</span>
                    <span>{formatPrice(cgst)}</span>
                  </div>

                  <div className="flex justify-between text-[11px] text-surface-450">
                    <span>SGST ({billingSettings.sgstPercent}%)</span>
                    <span>{formatPrice(sgst)}</span>
                  </div>

                  <div className="flex justify-between text-[11px] text-surface-450">
                    <span>Service Charge ({billingSettings.serviceChargeType === 'percent' ? `${billingSettings.serviceChargeValue}%` : `₹${billingSettings.serviceChargeValue}`})</span>
                    <span>{formatPrice(serviceCharge)}</span>
                  </div>

                  <div className="flex justify-between font-display font-extrabold text-sm text-surface-900 pt-3 border-t border-surface-150 mt-2">
                    <span>Grand Total</span>
                    <span className="text-[var(--color-terracotta)] text-base">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Primary Action Button (Review -> Checkout Form -> Pay) */}
                {checkoutStep === 1 ? (
                  <button
                    onClick={handleNextStep}
                    className="w-full btn btn-primary flex items-center justify-center gap-1.5 h-12 text-xs font-bold uppercase tracking-wider bg-[#1C1917] hover:bg-[var(--color-terracotta)] text-white rounded-full shadow hover:scale-[1.01] active:scale-[0.98]"
                    id="place-order"
                  >
                    Proceed to Checkout
                    <ChevronRight className="w-4 h-4 stroke-[3px]" />
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={processing}
                    className="w-full btn btn-primary flex items-center justify-center gap-1.5 h-12 text-xs font-bold uppercase tracking-wider bg-[#1C1917] hover:bg-[var(--color-terracotta)] text-white rounded-full shadow disabled:opacity-50 hover:scale-[1.01] active:scale-[0.98]"
                    id="place-order-submit"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Settling Order...
                      </span>
                    ) : (
                      <>
                        Confirm & Place Order · {formatPrice(total)}
                        <ChevronRight className="w-4 h-4 stroke-[3px]" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}

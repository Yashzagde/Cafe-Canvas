"use client";
import { create } from "zustand";

const useOrderStore = create((set) => ({
  orderId: null,
  razorpayOrderId: null,
  billData: null,
  customerDetails: { name: "", phone: "", orderType: "dine_in", tableNumber: "", address: "", note: "" },
  paymentStatus: "idle", // idle | processing | success | failed

  setCustomerDetails: (details) =>
    set((s) => ({ customerDetails: { ...s.customerDetails, ...details } })),

  setOrderData: (data) =>
    set({ orderId: data.orderId, razorpayOrderId: data.razorpayOrderId }),

  setBillData: (billData) =>
    set({ billData, paymentStatus: "success" }),

  setPaymentStatus: (status) => set({ paymentStatus: status }),

  reset: () =>
    set({
      orderId: null, razorpayOrderId: null, billData: null,
      paymentStatus: "idle",
      customerDetails: { name: "", phone: "", orderType: "dine_in", tableNumber: "", address: "", note: "" },
    }),
}));

export default useOrderStore;

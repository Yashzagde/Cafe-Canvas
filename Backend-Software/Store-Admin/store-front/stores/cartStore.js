"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const modKey = JSON.stringify(item.customisation || item.modifiers || []);
        const idx = items.findIndex(
          (i) => i.id === item.id && JSON.stringify(i.customisation || i.modifiers || []) === modKey
        );
        if (idx >= 0) {
          const updated = [...items];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + (item.quantity || 1) };
          set({ items: updated });
        } else {
          set({
            items: [...items, {
              id: item.id, name: item.name, price: item.price,
              image: item.image || item.imageUrl || null,
              quantity: item.quantity || item.qty || 1,
              customisation: item.customisation || null,
              modifiers: item.modifiers || [],
              isVeg: item.isVeg !== undefined ? item.isVeg : true,
            }],
          });
        }
      },

      removeItem: (id, customisation) => {
        const { items } = get();
        const modKey = JSON.stringify(customisation || []);
        set({ items: items.filter((i) => !(i.id === id && JSON.stringify(i.customisation || []) === modKey)) });
      },

      removeAtIndex: (index) => {
        const { items } = get();
        set({ items: items.filter((_, i) => i !== index) });
      },

      updateQuantity: (index, quantity) => {
        if (quantity < 1) return get().removeAtIndex(index);
        const { items } = get();
        const updated = [...items];
        updated[index] = { ...updated[index], quantity };
        set({ items: updated });
      },

      updateCustomisation: (index, customisation) => {
        const { items } = get();
        const updated = [...items];
        updated[index] = { ...updated[index], customisation };
        set({ items: updated });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const modExtra = (item.modifiers || []).reduce((ms, m) => ms + (m.extraPrice || 0), 0);
          const addonExtra = item.customisation?.addOns
            ? item.customisation.addOns.reduce((a, ao) => a + (ao.price || 0), 0)
            : 0;
          return sum + (item.price + modExtra + addonExtra) * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getItemQty: (id) => {
        const { items } = get();
        return items.filter((i) => i.id === id).reduce((sum, i) => sum + i.quantity, 0);
      },

      isInCart: (id) => {
        return get().items.some((i) => i.id === id);
      },
    }),
    {
      name: "cafe-canva-cart",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const host = window.location.host;
          const pathname = window.location.pathname;
          const parts = pathname.split("/").filter(Boolean);
          const pathSlug = parts[0] || "";
          const reserved = ["blog", "cart", "dine-in", "item", "items", "api"];
          const tenant = (pathSlug && !reserved.includes(pathSlug)) ? `${host}-${pathSlug}` : host;
          const val = localStorage.getItem(`cafe-cart-${tenant}`);
          return val ? JSON.parse(val) : null;
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          const host = window.location.host;
          const pathname = window.location.pathname;
          const parts = pathname.split("/").filter(Boolean);
          const pathSlug = parts[0] || "";
          const reserved = ["blog", "cart", "dine-in", "item", "items", "api"];
          const tenant = (pathSlug && !reserved.includes(pathSlug)) ? `${host}-${pathSlug}` : host;
          localStorage.setItem(`cafe-cart-${tenant}`, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          const host = window.location.host;
          const pathname = window.location.pathname;
          const parts = pathname.split("/").filter(Boolean);
          const pathSlug = parts[0] || "";
          const reserved = ["blog", "cart", "dine-in", "item", "items", "api"];
          const tenant = (pathSlug && !reserved.includes(pathSlug)) ? `${host}-${pathSlug}` : host;
          localStorage.removeItem(`cafe-cart-${tenant}`);
        }
      }
    }
  )
);

export default useCartStore;

import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number; // in paise
  quantity: number;
}

interface CartState {
  items: CartItem[];
  tenantId: string | null;
  tableId: string | null;
  setTenantId: (id: string) => void;
  setTableId: (id: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number; // in paise
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  tenantId: null,
  tableId: null,
  setTenantId: (id) => set({ tenantId: id }),
  setTableId: (id) => set({ tableId: id }),
  addItem: (item) => set((state) => {
    const existing = state.items.find((i) => i.id === item.id);
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: quantity <= 0
      ? state.items.filter((i) => i.id !== id)
      : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
  })),
  clearCart: () => set({ items: [] }),
  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));

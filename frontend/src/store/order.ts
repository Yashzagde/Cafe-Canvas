import { create } from 'zustand';

export interface OrderItem {
  id: string;
  name: string;
  price: number; // in paise
  quantity: number;
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'billed' | 'cancelled';
  items: OrderItem[];
  total: number; // in paise
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  addOrder: (order: Order) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  setOrders: (orders) => set({ orders }),
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),
  setLoading: (loading) => set({ loading }),
}));

import { create } from 'zustand';

export interface Table {
  id: string;
  name: string;
  capacity: number;
  section: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
}

interface TableState {
  tables: Table[];
  selectedTableId: string | null;
  setTables: (tables: Table[]) => void;
  setSelectedTableId: (id: string | null) => void;
  updateTableStatus: (id: string, status: Table['status']) => void;
}

export const useTableStore = create<TableState>((set) => ({
  tables: [],
  selectedTableId: null,
  setTables: (tables) => set({ tables }),
  setSelectedTableId: (id) => set({ selectedTableId: id }),
  updateTableStatus: (id, status) =>
    set((state) => ({
      tables: state.tables.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
}));

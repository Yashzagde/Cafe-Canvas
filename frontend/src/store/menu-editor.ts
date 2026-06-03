import { create } from 'zustand'

export interface MenuItem {
  id: string;
  name: string;
  price: number; // in rupees for UI
  cat: string;
  status: 'available' | 'unavailable' | 'hidden';
  desc: string;
}

interface MenuEditorState {
  selectedCategory: string | null;
  editingItem: MenuItem | null;
  isDirty: boolean;
  setSelectedCategory: (category: string | null) => void;
  setEditingItem: (item: MenuItem | null) => void;
  markDirty: () => void;
  clearDirty: () => void;
}

export const useMenuEditorStore = create<MenuEditorState>((set) => ({
  selectedCategory: null,
  editingItem: null,
  isDirty: false,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setEditingItem: (item) => set({ editingItem: item, isDirty: false }),
  markDirty: () => set({ isDirty: true }),
  clearDirty: () => set({ isDirty: false })
}))

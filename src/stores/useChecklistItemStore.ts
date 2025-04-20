
import { create } from 'zustand';
import type { Database } from '@/integrations/supabase/types';

type ChecklistItem = Database['public']['Tables']['checklist_items']['Row'];

interface ChecklistItemState {
  items: ChecklistItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setItems: (items: ChecklistItem[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addItem: (item: ChecklistItem) => void;
  updateItem: (item: ChecklistItem) => void;
  toggleItemCompletion: (id: string) => void;
  removeItem: (id: string) => void;
}

export const useChecklistItemStore = create<ChecklistItemState>()((set) => ({
  items: [],
  isLoading: false,
  error: null,
  
  setItems: (items) => set({ items }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  
  updateItem: (updatedItem) => set((state) => ({
    items: state.items.map((item) => 
      item.id === updatedItem.id ? updatedItem : item
    )
  })),
  
  toggleItemCompletion: (id) => set((state) => ({
    items: state.items.map((item) => 
      item.id === id ? { ...item, completed: !item.completed } : item
    )
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id)
  })),
}));

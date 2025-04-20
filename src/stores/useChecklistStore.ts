
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/lib/tanstack';
import type { Database } from '@/integrations/supabase/types';

type Checklist = Database['public']['Tables']['checklists']['Row'];

interface ChecklistState {
  checklists: Checklist[];
  selectedChecklistId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setChecklists: (checklists: Checklist[]) => void;
  selectChecklist: (id: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addChecklist: (checklist: Checklist) => void;
  updateChecklist: (checklist: Checklist) => void;
  removeChecklist: (id: string) => void;
}

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set) => ({
      checklists: [],
      selectedChecklistId: null,
      isLoading: false,
      error: null,
      
      setChecklists: (checklists) => set({ checklists }),
      selectChecklist: (id) => set({ selectedChecklistId: id }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      addChecklist: (checklist) => set((state) => ({ 
        checklists: [...state.checklists, checklist],
        selectedChecklistId: checklist.id
      })),
      
      updateChecklist: (updatedChecklist) => set((state) => ({
        checklists: state.checklists.map((checklist) => 
          checklist.id === updatedChecklist.id ? updatedChecklist : checklist
        )
      })),
      
      removeChecklist: (id) => set((state) => ({
        checklists: state.checklists.filter((checklist) => checklist.id !== id),
        selectedChecklistId: state.selectedChecklistId === id ? null : state.selectedChecklistId
      })),
    }),
    {
      name: 'checklist-storage',
      partialize: (state) => ({ 
        selectedChecklistId: state.selectedChecklistId 
      }),
    }
  )
);

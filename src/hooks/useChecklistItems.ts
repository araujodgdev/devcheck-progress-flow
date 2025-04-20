
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/tanstack';
import type { ChecklistItem, ChecklistItemInsert } from '@/types/checklist';

export function useChecklistItems(checklistId: string | undefined) {
  return useQuery({
    queryKey: ['checklist-items', checklistId],
    queryFn: async () => {
      if (!checklistId) return [];
      
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ChecklistItem[];
    },
    enabled: !!checklistId
  });
}

export function useCreateChecklistItem() {
  return useMutation({
    mutationFn: async (item: ChecklistItemInsert) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data as ChecklistItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-items', data.checklist_id] });
      toast.success('Item added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add item');
    }
  });
}

export function useUpdateChecklistItem() {
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ChecklistItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ChecklistItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-items', data.checklist_id] });
      toast.success('Item updated successfully');
    }
  });
}

export function useToggleChecklistItem() {
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .update({ completed })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ChecklistItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-items', data.checklist_id] });
    }
  });
}

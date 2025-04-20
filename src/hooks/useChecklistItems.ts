import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/tanstack';
import { useChecklistItemStore } from '@/stores/useChecklistItemStore';
import type { Database } from '@/integrations/supabase/types';

type ChecklistItem = Database['public']['Tables']['checklist_items']['Row'];
type ChecklistItemInsert = Database['public']['Tables']['checklist_items']['Insert'];

export function useChecklistItems(checklistId: string | undefined) {
  const { setItems, setIsLoading, setError } = useChecklistItemStore();

  const query = useQuery({
    queryKey: ['checklist-items', checklistId],
    queryFn: async () => {
      if (!checklistId) return [];
      
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as ChecklistItem[];
    },
    enabled: !!checklistId,
    meta: {
      onSuccess: (data: ChecklistItem[]) => {
        setItems(data);
      },
      onError: (error: Error) => {
        setError(error.message);
        toast.error('Failed to load checklist items');
      }
    }
  });

  return {
    ...query,
    isLoading: query.isLoading || query.isFetching,
  };
}

export function useCreateChecklistItem() {
  const { addItem } = useChecklistItemStore();

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
      addItem(data);
      queryClient.invalidateQueries({ queryKey: ['checklist-items', data.checklist_id] });
      toast.success('Item added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add item');
    }
  });
}

export function useUpdateChecklistItem() {
  const { updateItem } = useChecklistItemStore();

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
      updateItem(data);
      queryClient.invalidateQueries({ queryKey: ['checklist-items', data.checklist_id] });
      toast.success('Item updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update item');
    }
  });
}

export function useToggleChecklistItem() {
  const { toggleItemCompletion } = useChecklistItemStore();

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
    onMutate: async ({ id }) => {
      toggleItemCompletion(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-items', data.checklist_id] });
    },
    onError: (error: Error, variables) => {
      toggleItemCompletion(variables.id);
      toast.error('Failed to update item status');
    }
  });
}

export function useDeleteChecklistItem() {
  const { removeItem } = useChecklistItemStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      removeItem(id);
      queryClient.invalidateQueries({ queryKey: ['checklist-items'] });
      toast.success('Item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete item');
    }
  });
}

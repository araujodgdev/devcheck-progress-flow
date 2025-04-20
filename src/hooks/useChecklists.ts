
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/tanstack';
import { useChecklistStore } from '@/stores/useChecklistStore';
import type { Database } from '@/integrations/supabase/types';

type Checklist = Database['public']['Tables']['checklists']['Row'];
type ChecklistInsert = Database['public']['Tables']['checklists']['Insert'];

export function useChecklists(projectId: string | undefined) {
  const { setChecklists, setIsLoading, setError } = useChecklistStore();

  const query = useQuery({
    queryKey: ['checklists', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Checklist[];
    },
    enabled: !!projectId,
    onSuccess: (data) => {
      setChecklists(data);
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error('Failed to load checklists');
    }
  });

  return {
    ...query,
    isLoading: query.isLoading || query.isFetching,
  };
}

export function useChecklist(checklistId: string | undefined) {
  return useQuery({
    queryKey: ['checklists', 'detail', checklistId],
    queryFn: async () => {
      if (!checklistId) return null;
      
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('id', checklistId)
        .single();
      
      if (error) throw error;
      return data as Checklist;
    },
    enabled: !!checklistId,
    onError: (error: Error) => {
      toast.error('Failed to load checklist');
    }
  });
}

export function useCreateChecklist() {
  const { addChecklist } = useChecklistStore();

  return useMutation({
    mutationFn: async (checklist: ChecklistInsert) => {
      const { data, error } = await supabase
        .from('checklists')
        .insert(checklist)
        .select()
        .single();
      
      if (error) throw error;
      return data as Checklist;
    },
    onSuccess: (data) => {
      addChecklist(data);
      queryClient.invalidateQueries({ queryKey: ['checklists', data.project_id] });
      toast.success('Checklist created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create checklist');
    }
  });
}

export function useUpdateChecklist() {
  const { updateChecklist } = useChecklistStore();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Checklist> & { id: string }) => {
      const { data, error } = await supabase
        .from('checklists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Checklist;
    },
    onSuccess: (data) => {
      updateChecklist(data);
      queryClient.invalidateQueries({ queryKey: ['checklists', 'detail', data.id] });
      queryClient.invalidateQueries({ queryKey: ['checklists', data.project_id] });
      toast.success('Checklist updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update checklist');
    }
  });
}

export function useDeleteChecklist() {
  const { removeChecklist } = useChecklistStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id, variables, context) => {
      removeChecklist(id);
      // We don't know the project_id here so just invalidate all checklists
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete checklist');
    }
  });
}

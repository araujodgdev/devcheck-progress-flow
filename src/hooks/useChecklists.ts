
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/tanstack';
import type { Checklist, ChecklistInsert } from '@/types/checklist';

export function useChecklists(projectId: string | undefined) {
  return useQuery({
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
    enabled: !!projectId
  });
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
    enabled: !!checklistId
  });
}

export function useCreateChecklist() {
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
      queryClient.invalidateQueries({ queryKey: ['checklists', data.project_id] });
      toast.success('Checklist created successfully');
    }
  });
}

export function useUpdateChecklist() {
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
      queryClient.invalidateQueries({ queryKey: ['checklists', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['checklists', 'detail', data.id] });
      toast.success('Checklist updated successfully');
    }
  });
}

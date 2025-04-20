
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/tanstack';
import { useProjectStore } from '@/stores/useProjectStore';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

export function useProjects() {
  const { setProjects, setIsLoading, setError } = useProjectStore();

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Project[];
    },
    meta: {
      onSuccess: (data: Project[]) => {
        setProjects(data);
      },
      onError: (error: Error) => {
        setError(error.message);
        toast.error('Failed to load projects');
      }
    }
  });

  return {
    ...query,
    isLoading: query.isLoading || query.isFetching,
  };
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    enabled: !!projectId,
    onError: (error: Error) => {
      toast.error('Failed to load project');
    }
  });
}

export function useCreateProject() {
  const { addProject } = useProjectStore();

  return useMutation({
    mutationFn: async (project: ProjectInsert) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    onSuccess: (data) => {
      addProject(data);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create project');
    }
  });
}

export function useUpdateProject() {
  const { updateProject } = useProjectStore();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    onSuccess: (data) => {
      updateProject(data);
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] });
      toast.success('Project updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update project');
    }
  });
}

export function useDeleteProject() {
  const { removeProject } = useProjectStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      removeProject(id);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete project');
    }
  });
}

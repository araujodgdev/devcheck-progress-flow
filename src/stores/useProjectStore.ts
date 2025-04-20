
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/lib/tanstack';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  selectProject: (id: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      selectedProjectId: null,
      isLoading: false,
      error: null,
      
      setProjects: (projects) => set({ projects }),
      selectProject: (id) => set({ selectedProjectId: id }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      addProject: (project) => set((state) => ({ 
        projects: [...state.projects, project],
        selectedProjectId: project.id
      })),
      
      updateProject: (updatedProject) => set((state) => ({
        projects: state.projects.map((project) => 
          project.id === updatedProject.id ? updatedProject : project
        )
      })),
      
      removeProject: (id) => set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
        selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId
      })),
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({ 
        selectedProjectId: state.selectedProjectId 
      }),
    }
  )
);

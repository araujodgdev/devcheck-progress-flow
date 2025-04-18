
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function useDelete() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteProject = async (projectId: string) => {
    try {
      // Delete all associated checklists and their items first
      const { error: checklistItemsError } = await supabase
        .from('checklist_items')
        .delete()
        .eq('checklist_id', 
          supabase.from('checklists').select('id').eq('project_id', projectId)
        );

      const { error: checklistsError } = await supabase
        .from('checklists')
        .delete()
        .eq('project_id', projectId);

      // Then delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (projectError) throw projectError;

      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      toast.success('Projeto deletado com sucesso');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erro ao deletar projeto');
    }
  };

  const deleteChecklist = async (checklistId: string, projectId: string) => {
    try {
      // Delete all items in the checklist first
      const { error: itemsError } = await supabase
        .from('checklist_items')
        .delete()
        .eq('checklist_id', checklistId);

      // Then delete the checklist
      const { error: checklistError } = await supabase
        .from('checklists')
        .delete()
        .eq('id', checklistId);

      if (checklistError) throw checklistError;

      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['checklists', projectId] });
      
      toast.success('Checklist deletada com sucesso');
    } catch (error) {
      console.error('Error deleting checklist:', error);
      toast.error('Erro ao deletar checklist');
    }
  };

  const deleteChecklistItem = async (itemId: string, checklistId: string, projectId: string) => {
    try {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['checklists', projectId] });
      
      toast.success('Item deletado com sucesso');
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      toast.error('Erro ao deletar item');
    }
  };

  const toggleChecklistPublicAccess = async (checklistId: string, projectId: string) => {
    try {
      const { data: currentData, error: fetchError } = await supabase
        .from('checklists')
        .select('is_public')
        .eq('id', checklistId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('checklists')
        .update({ 
          is_public: !currentData.is_public 
        })
        .eq('id', checklistId);

      if (updateError) throw updateError;

      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['checklists', projectId] });
      
      toast.success(
        currentData.is_public 
          ? 'Checklist definida como privada' 
          : 'Checklist definida como pública'
      );

      return !currentData.is_public;
    } catch (error) {
      console.error('Error toggling checklist public access:', error);
      toast.error('Erro ao alterar visibilidade da checklist');
      return false;
    }
  };

  return { 
    deleteProject, 
    deleteChecklist, 
    deleteChecklistItem, 
    toggleChecklistPublicAccess 
  };
}

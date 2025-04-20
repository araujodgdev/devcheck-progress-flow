
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/tanstack';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

interface UseDeleteOptions {
  onSuccess?: () => void;
  successMessage?: string;
}

export function useDelete(options: UseDeleteOptions = {}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteRow = async (table: TableName, id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [table] });
      
      if (options.onSuccess) {
        options.onSuccess();
      }

      toast.success(options.successMessage || 'Item excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Error deleting row:', error);
      toast.error('Erro ao excluir item');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteRow, isDeleting };
}

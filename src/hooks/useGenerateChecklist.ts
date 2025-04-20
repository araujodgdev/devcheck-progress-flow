
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { generateChecklistWithItems } from '@/api/gemini';
import { queryClient } from '@/lib/tanstack';

export function useGenerateChecklist() {
  return useMutation({
    mutationFn: generateChecklistWithItems,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist generated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to generate checklist: ' + error.message);
    }
  });
}

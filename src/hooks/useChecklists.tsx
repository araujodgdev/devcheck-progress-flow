
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Checklist, ChecklistWithItems } from "@/types/checklist";

export function useChecklists(projectId: string) {
  return useQuery({
    queryKey: ["checklists", projectId],
    queryFn: async () => {
      const { data: checklists, error: checklistsError } = await supabase
        .from("checklists")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (checklistsError) throw checklistsError;

      const { data: items, error: itemsError } = await supabase
        .from("checklist_items")
        .select("*")
        .in(
          "checklist_id",
          checklists.map((c) => c.id)
        )
        .order("created_at", { ascending: true });

      if (itemsError) throw itemsError;

      return checklists.map((checklist) => ({
        ...checklist,
        items: items.filter((item) => item.checklist_id === checklist.id),
      })) as ChecklistWithItems[];
    },
  });
}

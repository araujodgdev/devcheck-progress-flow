
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Project } from "@/types/project";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });
}

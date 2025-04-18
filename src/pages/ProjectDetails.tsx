
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "@/hooks/useProject";
import { useChecklists } from "@/hooks/useChecklists";
import { Header } from "@/components/layout/Header";
import { NewChecklistDialog } from "@/components/checklist/NewChecklistDialog";
import { ChecklistCard } from "@/components/checklist/ChecklistCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChecklistPriority } from "@/types/checklist";

export default function ProjectDetails() {
  const { projectId = "" } = useParams();
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: checklists = [], isLoading: isLoadingChecklists } = useChecklists(projectId);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<ChecklistPriority | "all">("all");

  const filteredChecklists = checklists.filter((checklist) => {
    const matchesSearch = checklist.title.toLowerCase().includes(search.toLowerCase());
    if (priorityFilter === "all") return matchesSearch;
    return (
      matchesSearch &&
      checklist.items.some((item) => item.priority === priorityFilter)
    );
  });

  if (isLoadingProject || isLoadingChecklists) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{project?.name}</h1>
          <NewChecklistDialog projectId={projectId} />
        </div>

        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Buscar checklist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <select
            className="border rounded-md px-3 py-2"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as ChecklistPriority | "all")}
          >
            <option value="all">Todas as prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredChecklists.map((checklist) => (
            <ChecklistCard key={checklist.id} checklist={checklist} />
          ))}
        </div>
      </main>
    </div>
  );
}

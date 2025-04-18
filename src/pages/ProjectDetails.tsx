
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
import { useDelete } from "@/hooks/useDelete";
import { Trash, Share } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export default function ProjectDetails() {
  const { projectId = "" } = useParams();
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: checklists = [], isLoading: isLoadingChecklists } = useChecklists(projectId);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<ChecklistPriority | "all">("all");
  const { deleteProject } = useDelete();

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

  const handleDeleteProject = () => {
    deleteProject(projectId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{project?.name}</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deletar Projeto</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja deletar este projeto? 
                    Todos os checklists e itens serão removidos permanentemente.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-4">
                  <Button variant="outline">Cancelar</Button>
                  <Button variant="destructive" onClick={handleDeleteProject}>
                    Deletar Projeto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
            <ChecklistCard 
              key={checklist.id} 
              checklist={checklist} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}

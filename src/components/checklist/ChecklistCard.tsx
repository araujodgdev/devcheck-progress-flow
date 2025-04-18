
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import type { ChecklistWithItems, ChecklistPriority } from "@/types/checklist";
import { format } from "date-fns";
import { Trash, Share, Link as LinkIcon } from "lucide-react";
import { useDelete } from "@/hooks/useDelete";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface ChecklistCardProps {
  checklist: ChecklistWithItems;
}

export function ChecklistCard({ checklist }: ChecklistCardProps) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<ChecklistPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const queryClient = useQueryClient();
  const { deleteChecklist, deleteChecklistItem, toggleChecklistPublicAccess } = useDelete();
  const [isPublic, setIsPublic] = useState(checklist.is_public || false);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("checklist_items").insert({
        checklist_id: checklist.id,
        title: newItemTitle,
        priority: selectedPriority,
        due_date: dueDate || null,
      });

      if (error) throw error;

      setNewItemTitle("");
      setSelectedPriority("medium");
      setDueDate("");
      queryClient.invalidateQueries({ queryKey: ["checklists", checklist.project_id] });
      toast.success("Item adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar item");
    }
  };

  const toggleItemComplete = async (itemId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("checklist_items")
        .update({ completed })
        .eq("id", itemId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["checklists", checklist.project_id] });
    } catch (error) {
      toast.error("Erro ao atualizar item");
    }
  };

  const handleDeleteItem = (itemId: string) => {
    deleteChecklistItem(itemId, checklist.id, checklist.project_id);
  };

  const handleTogglePublicAccess = async () => {
    const newPublicStatus = await toggleChecklistPublicAccess(checklist.id, checklist.project_id);
    setIsPublic(newPublicStatus);
  };

  const generateShareLink = () => {
    if (!isPublic) {
      toast.error("Primeiro torne a checklist pública");
      return;
    }
    const shareUrl = `${window.location.origin}/public/checklists/${checklist.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link de compartilhamento copiado!");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>{checklist.title}</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant={isPublic ? "default" : "outline"}
            size="icon" 
            onClick={handleTogglePublicAccess}
            title={isPublic ? "Checklist Pública" : "Tornar Pública"}
          >
            <Share className="h-4 w-4" />
          </Button>
          {isPublic && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={generateShareLink}
              title="Copiar Link de Compartilhamento"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deletar Checklist</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja deletar esta checklist? 
                  Todos os itens serão removidos permanentemente.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-4">
                <Button variant="outline">Cancelar</Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteChecklist(checklist.id, checklist.project_id)}
                >
                  Deletar Checklist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {checklist.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) => toggleItemComplete(item.id, checked as boolean)}
              />
              <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                {item.title}
              </span>
              <span className="ml-auto text-sm text-muted-foreground">
                {item.priority}
                {item.due_date && ` - ${format(new Date(item.due_date), 'dd/MM/yyyy')}`}
              </span>
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => handleDeleteItem(item.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddItem} className="space-y-2">
          <Input
            placeholder="Novo item"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <select
              className="border rounded-md px-3 py-2 flex-1"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as ChecklistPriority)}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button type="submit" className="w-full">
            Adicionar Item
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

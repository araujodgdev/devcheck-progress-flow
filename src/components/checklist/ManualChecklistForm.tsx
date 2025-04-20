
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecklistNameInput } from "./ChecklistNameInput";

interface ManualChecklistFormProps {
  checklistName: string;
  onChecklistNameChange: (value: string) => void;
  onCreateChecklist: () => Promise<void>;
  loading: boolean;
}

export function ManualChecklistForm({
  checklistName,
  onChecklistNameChange,
  onCreateChecklist,
  loading
}: ManualChecklistFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist Manual</CardTitle>
        <CardDescription>
          Crie uma checklist vazia e adicione itens posteriormente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ChecklistNameInput 
            value={checklistName} 
            onChange={onChecklistNameChange} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onCreateChecklist} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Criando...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Criar Checklist
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

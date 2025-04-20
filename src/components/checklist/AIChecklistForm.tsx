
import { Loader2, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChecklistNameInput } from "./ChecklistNameInput";
import { GeneratedChecklistItems } from "./GeneratedChecklistItems";
import type { ChecklistItem } from "@/types/checklist";
import type { GenerateChecklistParams } from "@/api/gemini";
import { UseMutationResult } from "@tanstack/react-query";

interface AIChecklistFormProps {
  checklistName: string;
  onChecklistNameChange: (value: string) => void;
  projectType: string;
  onProjectTypeChange: (value: string) => void;
  teamSize: string;
  onTeamSizeChange: (value: string) => void;
  duration: string;
  onDurationChange: (value: string) => void;
  complexity: string;
  onComplexityChange: (value: string) => void;
  generatedItems: ChecklistItem[];
  selectedItems: string[];
  onToggleItem: (title: string) => void;
  onGenerateChecklist: () => void;
  onCreateChecklist: () => Promise<void>;
  generateMutation: UseMutationResult<any, Error, GenerateChecklistParams>;
  loading: boolean;
}

export function AIChecklistForm({
  checklistName,
  onChecklistNameChange,
  projectType,
  onProjectTypeChange,
  teamSize,
  onTeamSizeChange,
  duration,
  onDurationChange,
  complexity,
  onComplexityChange,
  generatedItems,
  selectedItems,
  onToggleItem,
  onGenerateChecklist,
  onCreateChecklist,
  generateMutation,
  loading
}: AIChecklistFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerar Checklist com IA</CardTitle>
        <CardDescription>
          Use IA para gerar automaticamente uma checklist baseada no seu projeto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ChecklistNameInput 
            value={checklistName} 
            onChange={onChecklistNameChange} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectType">Tipo de Projeto</Label>
              <Select value={projectType} onValueChange={onProjectTypeChange}>
                <SelectTrigger id="projectType">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                  <SelectItem value="research">Pesquisa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="teamSize">Tamanho da Equipe</Label>
              <Select value={teamSize} onValueChange={onTeamSizeChange}>
                <SelectTrigger id="teamSize">
                  <SelectValue placeholder="Tamanho da equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequena (1-3)</SelectItem>
                  <SelectItem value="medium">Média (4-10)</SelectItem>
                  <SelectItem value="large">Grande (10+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="duration">Duração</Label>
              <Select value={duration} onValueChange={onDurationChange}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Duração do projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 week">1 semana</SelectItem>
                  <SelectItem value="2 weeks">2 semanas</SelectItem>
                  <SelectItem value="1 month">1 mês</SelectItem>
                  <SelectItem value="3 months">3 meses</SelectItem>
                  <SelectItem value="6 months">6 meses</SelectItem>
                  <SelectItem value="1 year">1 ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="complexity">Complexidade</Label>
              <Select value={complexity} onValueChange={onComplexityChange}>
                <SelectTrigger id="complexity">
                  <SelectValue placeholder="Complexidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={onGenerateChecklist} 
            disabled={generateMutation.isPending} 
            variant="outline" 
            className="w-full"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Gerando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar Itens da Checklist
              </>
            )}
          </Button>
          
          {generateMutation.isError && (
            <p className="text-red-500 text-sm">
              {generateMutation.error instanceof Error ? generateMutation.error.message : "Erro ao gerar checklist"}
            </p>
          )}
          
          <GeneratedChecklistItems 
            items={generatedItems} 
            selectedItems={selectedItems} 
            onToggleItem={onToggleItem} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onCreateChecklist}
          disabled={loading || (selectedItems.length === 0)}
        >
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

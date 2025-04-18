
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  projectType: z.string().min(1, "Selecione um tipo de projeto"),
  teamSize: z.string().min(1, "Selecione o tamanho da equipe"),
  duration: z.string().min(1, "Selecione a duração estimada"),
  complexity: z.string().min(1, "Selecione o nível de complexidade"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      projectType: "",
      teamSize: "",
      duration: "",
      complexity: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      // 1. Create the project
      const { data: projectData, error: projectError } = await supabase.from("projects").insert({
        name: values.name,
        description: values.description,
        user_id: user?.id,
      }).select().single();

      if (projectError) throw projectError;

      // 2. Generate checklist using Gemini API
      const response = await fetch('http://localhost:54321/functions/v1/generate-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          projectName: values.name,
          projectDescription: values.description,
          projectType: values.projectType,
          teamSize: values.teamSize,
          duration: values.duration, 
          complexity: values.complexity
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate checklist items');
      }

      const { items } = await response.json();

      // 3. Create the checklist for the project
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .insert({
          project_id: projectData.id,
          title: `${values.name} - Checklist Principal`,
          description: `Checklist automática gerada para o projeto ${values.name}`,
        })
        .select()
        .single();

      if (checklistError) throw checklistError;

      // 4. Create the checklist items based on AI suggestion
      const processedItems = items.map((item: any) => {
        let dueDateObj = null;
        if (item.due_date) {
          // Convert relative time (e.g., "1 week", "2 months") to an actual date
          const now = new Date();
          const match = item.due_date.match(/(\d+)\s+(\w+)/);
          if (match) {
            const amount = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            
            if (unit.includes('day')) {
              now.setDate(now.getDate() + amount);
            } else if (unit.includes('week')) {
              now.setDate(now.getDate() + (amount * 7));
            } else if (unit.includes('month')) {
              now.setMonth(now.getMonth() + amount);
            }
            dueDateObj = now.toISOString();
          }
        }
        
        return {
          checklist_id: checklistData.id,
          title: item.title,
          priority: item.priority.toLowerCase(),
          due_date: dueDateObj,
        };
      });

      const { error: itemsError } = await supabase
        .from("checklist_items")
        .insert(processedItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Projeto criado com sucesso!",
        description: "Uma checklist inicial foi gerada automaticamente com base nas características do projeto.",
      });

      navigate(`/projects/${projectData.id}`);
    } catch (error) {
      console.error('Error creating project with AI checklist:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar projeto",
        description: "Não foi possível gerar a checklist automática. Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-2">Novo Projeto</h1>
        <p className="text-muted-foreground mb-8">
          Preencha os detalhes abaixo para criar um novo projeto e gerar uma checklist automática.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto</FormLabel>
                  <FormControl>
                    <Input placeholder="Meu novo projeto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva seu projeto..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Projeto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="software">Desenvolvimento de Software</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="research">Pesquisa</SelectItem>
                        <SelectItem value="event">Evento</SelectItem>
                        <SelectItem value="construction">Construção</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho da Equipe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar tamanho" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="small">Pequeno (1-3 pessoas)</SelectItem>
                        <SelectItem value="medium">Médio (4-10 pessoas)</SelectItem>
                        <SelectItem value="large">Grande (11-30 pessoas)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (30+ pessoas)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração Estimada</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="short" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Curto (< 1 mês)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="medium" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Médio (1-3 meses)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="long" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Longo (3-12 meses)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="extended" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Extenso (1+ anos)
                          </FormLabel>
                        </FormItem>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="complexity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Complexidade</FormLabel>
                  <FormDescription>Defina o nível de complexidade do projeto</FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="simple" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Simples
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="moderate" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Moderado
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="complex" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Complexo
                          </FormLabel>
                        </FormItem>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex gap-2 items-center"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Criando..." : "Criar Projeto com IA"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

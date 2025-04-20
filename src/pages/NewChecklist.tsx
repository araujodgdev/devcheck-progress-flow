import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, List, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { 
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { 
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Define uma interface para os itens gerados da checklist
interface ChecklistItem {
	title: string;
	priority: string;
	due_date: string;
}

// Define uma interface para o projeto compatível com o que vem do banco
interface Project {
	id: string;
	name: string;  // Usado 'name' em vez de 'title' para corresponder ao banco
	description: string;
	status: string;
	priority: string;
}

// Define uma interface de tipo para a coluna priority do checklist_items
type PriorityType = "low" | "medium" | "high";

export default function NewChecklist() {
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [checklistName, setChecklistName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [project, setProject] = useState<Project | null>(null);
	const [mode, setMode] = useState<"manual" | "ai">("manual");
	const [generatedItems, setGeneratedItems] = useState<ChecklistItem[]>([]);
	const [selectedItems, setSelectedItems] = useState<string[]>([]);
	const [aiLoading, setAiLoading] = useState(false);
	const [aiError, setAiError] = useState("");
	
	// AI generation form fields
	const [projectType, setProjectType] = useState("software");
	const [teamSize, setTeamSize] = useState("small");
	const [duration, setDuration] = useState("1 month");
	const [complexity, setComplexity] = useState("medium");

	// Fetch project details when component loads
	useEffect(() => {
		async function fetchProject() {
			if (!projectId) return;
			
			try {
				const { data, error } = await supabase
					.from("projects")
					.select("*")
					.eq("id", projectId)
					.single();
				
				if (error) throw error;
				setProject(data as Project);
				// Use project name as default checklist name
				setChecklistName(data.name ? `Checklist: ${data.name}` : "");
			} catch (err) {
				console.error("Error fetching project:", err);
			}
		}
		
		fetchProject();
	}, [projectId]);

	const handleCreateChecklist = async () => {
		if (!checklistName) {
			setError("Nome da checklist é obrigatório");
			return;
		}

		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("checklists")
				.insert({
					title: checklistName,
					project_id: projectId,
					user_id: user?.id,
				})
				.select()
				.single();

			if (error) throw error;
			
			navigate(`/dashboard/projects/${projectId}/checklists/${data.id}`);
		} catch (error: unknown) {
			setError("Erro ao criar checklist");
			console.error("Error creating checklist:", error);
		} finally {
			setLoading(false);
		}
	};
	
	// Handle AI checklist generation
	const generateChecklist = async () => {
		if (!project) return;
		
		setAiLoading(true);
		setAiError("");
		
		try {
            
			// Usando a URL correta para a sua função do Supabase
			const response = await fetch('https://pzyraptsgyqwnzwavoyg.supabase.co/functions/v1/generate-checklist', {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					projectName: project.name,
					projectDescription: project.description || "",
					projectType,
					teamSize,
					duration,
					complexity
				})
			});
			
			const result = await response.json();
			
			if (!response.ok) {
				throw new Error(result.error || "Falha ao gerar checklist");
			}
			
			if (result.items && Array.isArray(result.items)) {
				setGeneratedItems(result.items);
				// Select all items by default
				setSelectedItems(result.items.map(item => item.title));
			} else {
				throw new Error("Formato de resposta inválido");
			}
		} catch (err) {
			setAiError(err instanceof Error ? err.message : "Erro ao gerar checklist");
		} finally {
			setAiLoading(false);
		}
	};
	
	// Toggle item selection
	const toggleItemSelection = (title: string) => {
		setSelectedItems(prev => 
			prev.includes(title)
				? prev.filter(item => item !== title)
				: [...prev, title]
		);
	};

	return (
		<div className="container mx-auto p-4 max-w-3xl">
			<h1 className="text-2xl font-bold mb-6">Criar Nova Checklist</h1>
			
			<Tabs defaultValue="manual" onValueChange={(val) => setMode(val as "manual" | "ai")}>
				<TabsList className="mb-4">
					<TabsTrigger value="manual">
						<List className="w-4 h-4 mr-2" />
						Criar Manualmente
					</TabsTrigger>
					<TabsTrigger value="ai">
						<RefreshCw className="w-4 h-4 mr-2" />
						Gerar com IA
					</TabsTrigger>
				</TabsList>
				
				<TabsContent value="manual">
					<Card>
						<CardHeader>
							<CardTitle>Checklist Manual</CardTitle>
							<CardDescription>
								Crie uma checklist vazia e adicione itens posteriormente
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<Label htmlFor="checklistName">Nome da Checklist</Label>
									<input
										id="checklistName"
										type="text"
										value={checklistName}
										onChange={(e) => setChecklistName(e.target.value)}
										className="border rounded-md p-2 mt-1 w-full"
										placeholder="Nome da checklist"
									/>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button onClick={handleCreateChecklist} disabled={loading}>
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
				</TabsContent>
				
				<TabsContent value="ai">
					<Card>
						<CardHeader>
							<CardTitle>Gerar Checklist com IA</CardTitle>
							<CardDescription>
								Use IA para gerar automaticamente uma checklist baseada no seu projeto
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<Label htmlFor="aiChecklistName">Nome da Checklist</Label>
									<input
										id="aiChecklistName"
										type="text"
										value={checklistName}
										onChange={(e) => setChecklistName(e.target.value)}
										className="border rounded-md p-2 mt-1 w-full"
										placeholder="Nome da checklist"
									/>
								</div>
								
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="projectType">Tipo de Projeto</Label>
										<Select value={projectType} onValueChange={setProjectType}>
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
										<Select value={teamSize} onValueChange={setTeamSize}>
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
										<Select value={duration} onValueChange={setDuration}>
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
										<Select value={complexity} onValueChange={setComplexity}>
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
									onClick={generateChecklist} 
									disabled={aiLoading} 
									variant="outline" 
									className="w-full"
								>
									{aiLoading ? (
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
								
								{aiError && (
									<p className="text-red-500 text-sm">{aiError}</p>
								)}
								
								{generatedItems.length > 0 && (
									<div className="mt-4">
										<h3 className="font-medium mb-2">Itens Gerados</h3>
										<div className="border rounded-md p-3 max-h-80 overflow-y-auto">
											{generatedItems.map((item, index) => (
												<div 
													key={`item-${item.title}-${index}`} 
													className="flex items-start space-x-2 mb-2 pb-2 border-b last:border-0"
												>
													<Checkbox 
														id={`item-${index}`}
														checked={selectedItems.includes(item.title)}
														onCheckedChange={() => toggleItemSelection(item.title)}
													/>
													<div className="flex-1">
														<Label htmlFor={`item-${index}`} className="font-medium">{item.title}</Label>
														<div className="flex space-x-2 text-sm text-muted-foreground">
															<span>Prioridade: {item.priority}</span>
															<span>•</span>
															<span>Prazo: {item.due_date}</span>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</CardContent>
						<CardFooter>
							<Button 
								onClick={handleCreateChecklist}
								disabled={loading || (mode === "ai" && selectedItems.length === 0)}
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
				</TabsContent>
			</Tabs>
			
			{error && <p className="text-red-500 mt-4">{error}</p>}
		</div>
	);
}
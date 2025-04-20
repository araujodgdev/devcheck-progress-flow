import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { List, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useGenerateChecklist } from "@/hooks/useGenerateChecklist";
import type { ChecklistItem } from "@/types/checklist";
import type { GenerateChecklistParams } from "@/api/gemini";
import { ManualChecklistForm } from "@/components/checklist/ManualChecklistForm";
import { AIChecklistForm } from "@/components/checklist/AIChecklistForm";

// Define uma interface para o projeto compatível com o que vem do banco
interface Project {
	id: string;
	name: string;
	description: string;
	status: string;
	priority: string;
}

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
	
	// AI generation form fields
	const [projectType, setProjectType] = useState("software");
	const [teamSize, setTeamSize] = useState("small");
	const [duration, setDuration] = useState("1 month");
	const [complexity, setComplexity] = useState("medium");
	
	// Use the custom hook for generating checklists
	const generateMutation = useGenerateChecklist();
	
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
	const handleGenerateChecklist = async () => {
		if (!project || !projectId || !user?.id) {
			toast.error("Dados do projeto incompletos");
			return;
		}
		
		const params: GenerateChecklistParams = {
			projectName: project.name,
			projectDescription: project.description || "",
			projectType,
			teamSize,
			duration,
			complexity,
			userId: user.id,
			projectId: projectId
		};
		
		generateMutation.mutate(params, {
			onSuccess: (data) => {
				if (data?.items) {
					setGeneratedItems(data.items);
					// Selecionar todos os itens por padrão
					setSelectedItems(data.items.map(item => item.title));
					toast.success("Checklist gerada com sucesso!");
				}
			},
			onError: (err) => {
				setError(typeof err === 'string' ? err : err instanceof Error ? err.message : 'Erro ao gerar checklist');
				toast.error("Falha ao gerar checklist");
			}
		});
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
					<ManualChecklistForm
						checklistName={checklistName}
						onChecklistNameChange={setChecklistName}
						onCreateChecklist={handleCreateChecklist}
						loading={loading}
					/>
				</TabsContent>
				
				<TabsContent value="ai">
					<AIChecklistForm
						checklistName={checklistName}
						onChecklistNameChange={setChecklistName}
						projectType={projectType}
						onProjectTypeChange={setProjectType}
						teamSize={teamSize}
						onTeamSizeChange={setTeamSize}
						duration={duration}
						onDurationChange={setDuration}
						complexity={complexity}
						onComplexityChange={setComplexity}
						generatedItems={generatedItems}
						selectedItems={selectedItems}
						onToggleItem={toggleItemSelection}
						onGenerateChecklist={handleGenerateChecklist}
						onCreateChecklist={handleCreateChecklist}
						generateMutation={generateMutation}
						loading={loading}
					/>
				</TabsContent>
			</Tabs>
			
			{error && <p className="text-red-500 mt-4">{error}</p>}
		</div>
	);
}

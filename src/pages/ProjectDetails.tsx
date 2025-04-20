
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useProject } from "@/hooks/useProjects";
import { useChecklists } from "@/hooks/useChecklists";
import { useDeleteProject } from "@/hooks/useProjects";
import type { Database } from "@/integrations/supabase/types";

type Project = Database['public']['Tables']['projects']['Row'];

export default function ProjectDetails() {
	const { projectId } = useParams();
	const navigate = useNavigate();
	
	const { 
		data: project, 
		isLoading: isLoadingProject, 
		error: projectError 
	} = useProject(projectId);
	
	const deleteProjectMutation = useDeleteProject();

	const handleDeleteProject = async () => {
		if (!projectId) return;
		
		await deleteProjectMutation.mutateAsync(projectId);
		navigate("/dashboard");
	};

	if (isLoadingProject) {
		return (
			<div className="flex items-center justify-center h-40">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
			</div>
		);
	}

	if (projectError || !project) {
		return (
			<Alert variant="destructive">
				<AlertDescription>Failed to load project details</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">{project.name}</h1>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="destructive">
							{deleteProjectMutation.isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Trash2 className="mr-2 h-4 w-4" />
							)}
							Excluir Projeto
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Tem certeza?</AlertDialogTitle>
							<AlertDialogDescription>
								Esta ação não pode ser desfeita. Isso excluirá permanentemente o
								projeto e todos os checklists associados.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancelar</AlertDialogCancel>
							<AlertDialogAction onClick={handleDeleteProject}>
								Continuar
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			<div className="bg-card rounded-md shadow-sm p-4">
				<h2 className="text-xl font-semibold mb-4">Checklists</h2>
				{/* Display checklists related to the project */}
				{project.id ? (
					<Checklists projectId={project.id} />
				) : (
					<p>No checklists associated with this project.</p>
				)}
			</div>
		</div>
	);
}

function Checklists({ projectId }: { projectId: string }) {
	const { 
		data: checklists, 
		isLoading, 
		error 
	} = useChecklists(projectId);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-20">
				<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertDescription>Failed to load checklists</AlertDescription>
			</Alert>
		);
	}

	return (
		<div>
			{checklists && checklists.length > 0 ? (
				<ul className="space-y-2 mb-4">
					{checklists.map((checklist) => (
						<li
							key={checklist.id}
							className="border rounded-md p-2 hover:bg-accent"
						>
							<Link to={`/dashboard/projects/${projectId}/checklists/${checklist.id}`}>
								{checklist.title}
							</Link>
						</li>
					))}
				</ul>
			) : (
				<p className="mb-4">No checklists found for this project.</p>
			)}
			<Link to={`/dashboard/projects/${projectId}/checklists/new`}>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add New Checklist
				</Button>
			</Link>
		</div>
	);
}

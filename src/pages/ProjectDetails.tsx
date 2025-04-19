import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { supabase } from "@/lib/supabase";
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
import { Loader2, Trash2 } from "lucide-react";
import { useDelete } from "@/hooks/useDelete";
import { Link } from "react-router-dom";

export default function ProjectDetails() {
	const { projectId } = useParams();
	const navigate = useNavigate();
	const [project, setProject] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { deleteRow, isDeleting } = useDelete({
		onSuccess: () => navigate("/dashboard"),
		successMessage: "Projeto excluído com sucesso",
	});

	useEffect(() => {
		async function fetchProject() {
			try {
				const { data, error } = await supabase
					.from("projects")
					.select("*")
					.eq("id", projectId)
					.single();

				if (error) throw error;
				setProject(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchProject();
	}, [projectId]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	const handleDeleteProject = async () => {
		await deleteRow("projects", projectId);
	};

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">{project?.name}</h1>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="destructive">
							{isDeleting ? (
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
				{project?.id ? (
					<Checklists projectId={project.id} />
				) : (
					<p>No checklists associated with this project.</p>
				)}
			</div>
		</div>
	);
}

function Checklists({ projectId }: { projectId: string }) {
	const [checklists, setChecklists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchChecklists() {
			try {
				const { data, error } = await supabase
					.from("checklists")
					.select("*")
					.eq("project_id", projectId);

				if (error) throw error;
				setChecklists(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchChecklists();
	}, [projectId]);

	if (loading) {
		return <div>Loading checklists...</div>;
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div>
			{checklists.length > 0 ? (
				<ul className="space-y-2">
					{checklists.map((checklist) => (
						<li
							key={checklist.id}
							className="border rounded-md p-2 hover:bg-accent"
						>
							<Link to={`/projects/${projectId}/checklists/${checklist.id}`}>
								{checklist.title}
							</Link>
						</li>
					))}
				</ul>
			) : (
				<p>No checklists found for this project.</p>
			)}
			<Link to={`/projects/${projectId}/checklists/new`}>
				<Button>Add New Checklist</Button>
			</Link>
		</div>
	);
}

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
import { Loader2, Trash2, Share2 } from "lucide-react";
import { useDelete } from "@/hooks/useDelete";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { ChecklistItem } from "@/types/checklist";

export default function ChecklistDetails() {
	const { projectId, checklistId } = useParams();
	const navigate = useNavigate();
	const [checklist, setChecklist] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { deleteRow, isDeleting } = useDelete({
		onSuccess: () => navigate(`/projects/${projectId}`),
		successMessage: "Checklist excluída com sucesso",
	});
	const [newItemTitle, setNewItemTitle] = useState("");
	const [isAddingItem, setIsAddingItem] = useState(false);

	useEffect(() => {
		async function fetchChecklist() {
			try {
				const { data, error } = await supabase
					.from("checklists")
					.select("*, items:checklist_items(*)")
					.eq("id", checklistId)
					.single();

				if (error) throw error;
				setChecklist(data);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchChecklist();
	}, [checklistId]);

	const handleDeleteChecklist = async () => {
		await deleteRow("checklists", checklistId);
	};

	const togglePublicAccess = async () => {
		try {
			const { data, error } = await supabase
				.from("checklists")
				.update({ is_public: !checklist.is_public })
				.eq("id", checklistId)
				.select()
				.single();

			if (error) throw error;
			setChecklist(data);
			toast.success(
				data.is_public
					? "Checklist tornada pública"
					: "Checklist tornada privada",
			);
		} catch (err: any) {
			toast.error("Erro ao alterar visibilidade da checklist");
		}
	};

	const copyShareableLink = () => {
		const link = `${window.location.origin}/shared/checklist/${checklist.public_access_id}`;
		navigator.clipboard.writeText(link);
		toast.success("Link copiado para a área de transferência");
	};

	const handleCreateChecklistItem = async () => {
		setIsAddingItem(true);
		try {
			const { data, error } = await supabase
				.from("checklist_items")
				.insert([{ checklist_id: checklistId, title: newItemTitle }])
				.select("*")
				.single();

			if (error) throw error;

			setChecklist({
				...checklist,
				items: [...checklist.items, data],
			});
			setNewItemTitle("");
		} catch (err: any) {
			toast.error("Erro ao criar item");
			console.error(err);
		} finally {
			setIsAddingItem(false);
		}
	};

	const toggleChecklistItem = async (item: ChecklistItem) => {
		try {
			const { data, error } = await supabase
				.from("checklist_items")
				.update({ completed: !item.completed })
				.eq("id", item.id)
				.select("*")
				.single();

			if (error) throw error;

			setChecklist({
				...checklist,
				items: checklist.items.map((i: ChecklistItem) =>
					i.id === item.id ? data : i,
				),
			});
		} catch (err: any) {
			toast.error("Erro ao atualizar item");
			console.error(err);
		}
	};

	const updateChecklistItemDueDate = async (
		item: ChecklistItem,
		date: Date | undefined,
	) => {
		try {
			const { data, error } = await supabase
				.from("checklist_items")
				.update({ due_date: date ? format(date, "yyyy-MM-dd") : null })
				.eq("id", item.id)
				.select("*")
				.single();

			if (error) throw error;

			setChecklist({
				...checklist,
				items: checklist.items.map((i: ChecklistItem) =>
					i.id === item.id ? data : i,
				),
			});
		} catch (err: any) {
			toast.error("Erro ao atualizar data do item");
			console.error(err);
		}
	};

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

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">{checklist?.title}</h1>
				<div className="flex gap-2">
					<Button variant="outline" onClick={togglePublicAccess}>
						{checklist?.is_public ? "Tornar Privada" : "Tornar Pública"}
					</Button>
					{checklist?.is_public && (
						<Button variant="outline" onClick={copyShareableLink}>
							<Share2 className="mr-2 h-4 w-4" />
							Copiar Link
						</Button>
					)}
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive">
								{isDeleting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Trash2 className="mr-2 h-4 w-4" />
								)}
								Excluir Checklist
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Tem certeza?</AlertDialogTitle>
								<AlertDialogDescription>
									Esta ação não pode ser desfeita. Isso excluirá permanentemente
									a checklist e todos os seus itens.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancelar</AlertDialogCancel>
								<AlertDialogAction onClick={handleDeleteChecklist}>
									Continuar
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			<div className="mb-4">
				<div className="flex items-center">
					<Input
						type="text"
						placeholder="Novo item..."
						value={newItemTitle}
						onChange={(e) => setNewItemTitle(e.target.value)}
						className="mr-2"
					/>
					<Button onClick={handleCreateChecklistItem} disabled={isAddingItem}>
						{isAddingItem ? "Adicionando..." : "Adicionar Item"}
					</Button>
				</div>
			</div>
			<div>
				{checklist?.items?.map((item: ChecklistItem) => (
					<div
						key={item.id}
						className="flex items-center justify-between py-2 border-b"
					>
						<div className="flex items-center">
							<Checkbox
								id={`item-${item.id}`}
								checked={item.completed}
								onCheckedChange={() => toggleChecklistItem(item)}
							/>
							<label
								htmlFor={`item-${item.id}`}
								className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								{item.title}
							</label>
						</div>
						<div className="flex items-center">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"ghost"}
										className={cn(
											"h-8 w-8 p-0 font-normal",
											!item.due_date && "text-muted-foreground",
										)}
									>
										{item.due_date ? (
											format(new Date(item.due_date), "MMM dd, yyyy")
										) : (
											<span>Definir data</span>
										)}
										<CalendarIcon className="ml-2 h-4 w-4" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="end">
									<Calendar
										mode="single"
										selected={
											item.due_date ? new Date(item.due_date) : undefined
										}
										onSelect={(date) => updateChecklistItemDueDate(item, date)}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

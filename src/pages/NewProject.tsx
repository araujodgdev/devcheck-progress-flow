
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NewProject() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const { data, error } = await supabase
				.from("projects")
				.insert([
					{
						title,
						description,
						user_id: user?.id,
					},
				])
				.select()
				.single();

			if (error) throw error;

			navigate(`/projects/${data.id}`);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto p-4 max-w-2xl">
			<h1 className="text-2xl font-bold mb-6">Novo Projeto</h1>
			{error && (
				<Alert variant="destructive" className="mb-4">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="title" className="block text-sm font-medium mb-1">
						Nome do Projeto
					</label>
					<Input
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
					/>
				</div>
				<div>
					<label
						htmlFor="description"
						className="block text-sm font-medium mb-1"
					>
						Descrição
					</label>
					<Textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={4}
					/>
				</div>
				<Button type="submit" disabled={loading}>
					{loading ? "Criando..." : "Criar Projeto"}
				</Button>
			</form>
		</div>
	);
}

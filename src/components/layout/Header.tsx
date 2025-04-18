import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";

export function Header() {
	const { theme, setTheme } = useTheme();
	const { user } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await supabase.auth.signOut();
			toast.success("Logout realizado com sucesso!");
			navigate("/");
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Erro ao fazer logout";
			toast.error(errorMessage);
		}
	};

	return (
		<header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-sm">
			<div className="container flex h-16 items-center justify-between">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent border-none bg-transparent p-0"
					>
						DevCheck
					</button>
				</div>
				<div className="flex items-center gap-4">
					<div className={`${location.pathname === "/auth" ? "hidden" : ""}`}>
						{user ? (
							<Button variant="outline" onClick={handleLogout}>
								Sair
							</Button>
						) : (
							<Button onClick={() => navigate("/auth")}>Entrar</Button>
						)}
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="relative transition-colors duration-200"
						aria-label={
							theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
						}
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						<SunIcon className="h-5 w-5 transition-transform duration-200 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
						<MoonIcon className="absolute h-5 w-5 transition-transform duration-200 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
					</Button>
				</div>
			</div>
		</header>
	);
}

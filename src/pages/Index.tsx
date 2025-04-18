import { useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { TypeWriter } from "@/components/ui/type-writer";
import {
	ArrowRight,
	Bell,
	ChartLine,
	ChartNoAxesCombined,
	CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const handleStart = () => {
		if (user) navigate("/dashboard");

		navigate("/auth");
	};

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<main className="container max-w-5xl pt-16 pb-12">
					<section className="container py-12 lg:py-28 flex flex-col items-center justify-center max-w-5xl mx-auto text-center">
						<div className="space-y-4 mb-8">
							<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
								Torne seu desenvolvimento
								<br />
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
									<TypeWriter
										words={[
											"inteligente",
											"eficiente",
											"produtivo",
											"organizado",
										]}
									/>
								</span>
							</h1>
							<p className="max-w-[700px] text-lg md:text-xl text-muted-foreground mx-auto">
								Otimize seu fluxo de desenvolvimento com checklists inteligentes
								projetadas para equipes modernas. Acompanhe o progresso,
								colabore e entregue com confiança.
							</p>
						</div>
						<div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
							<Button className="gap-2">
								Começar agora
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>

						<div className="absolute -z-10 inset-0 overflow-hidden pointer-events-none">
							<div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-3xl" />
							<div className="absolute -bottom-[20%] -left-[20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-3xl" />
						</div>
				</section>

				<section className="py-12 md:py-24 lg:py-8">
					<div className="container px-4 md:px-6">
						<div className="grid gap-6 lg:grid-cols-3">
							<div className="flex flex-col items-center space-y-4 text-center">
								<div className="space-y-2 flex flex-col items-center">
									<CheckCircle className="h-12 w-12 text-indigo-500" />
									<h3 className="text-xl font-bold">Organize suas tarefas</h3>
									<p className="text-muted-foreground">
										Crie checklists personalizadas para seus projetos
									</p>
								</div>
							</div>
							<div className="flex flex-col items-center space-y-4 text-center">
								<div className="space-y-2 flex flex-col items-center">
									<ChartLine className="h-12 w-12 text-indigo-500" />
									<h3 className="text-xl font-bold">Acompanhe seu progresso</h3>
									<p className="text-muted-foreground">
										Visualize seu avanço com estatísticas inteligentes
									</p>
								</div>
							</div>
							<div className="flex flex-col items-center space-y-4 text-center">
								<div className="space-y-2 flex flex-col items-center">
									<ChartNoAxesCombined className="h-12 w-12 text-indigo-500" />
									<h3 className="text-xl font-bold">
										Melhore sua produtividade
									</h3>
									<p className="text-muted-foreground">
										Foque no que importa com lembretes e priorização
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

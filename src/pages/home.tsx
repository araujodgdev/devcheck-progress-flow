import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/layouts/site-layout";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/typewriter";
import {
	Code,
	ListChecks,
	Users,
	Clock,
	Zap,
	Database,
	Globe,
	Shield,
} from "lucide-react";

export default function HomePage() {
	const typewriterTexts = [
		"Track your project tasks efficiently",
		"Never miss a deployment step",
		"Streamline your development workflow",
		"Collaborate with your team seamlessly",
	];

	return (
		<SiteLayout>
			{/* Hero Section */}
			<section className="relative">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
					<div className="text-center">
						<h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
							Efficient Project Management for Developers
						</h1>
						<div className="text-xl md:text-2xl text-muted-foreground mb-8">
							<Typewriter texts={typewriterTexts} />
						</div>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/register">
								<Button size="lg" className="font-semibold px-8">
									Get Started
								</Button>
							</Link>
							<Link to="/docs">
								<Button
									size="lg"
									variant="outline"
									className="font-semibold px-8"
								>
									View Documentation
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-muted/50 py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Supercharge Your Development Workflow
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							DevCheck provides everything developers need to manage projects
							efficiently.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{[
							{
								icon: ListChecks,
								title: "Smart Checklists",
								description:
									"Create, customize, and reuse checklists for any development workflow.",
							},
							{
								icon: Users,
								title: "Team Collaboration",
								description:
									"Share checklists with team members and collaborate in real-time.",
							},
							{
								icon: Clock,
								title: "Real-time Updates",
								description:
									"See changes instantly with real-time syncing across all devices.",
							},
							{
								icon: Zap,
								title: "AI Generation",
								description:
									"Generate project checklists automatically using AI recommendations.",
							},
						].map((feature, index) => (
							<div
								key={index}
								className="bg-card p-6 rounded-lg shadow-sm border transition-all hover:shadow-md"
							>
								<div className="p-2 bg-primary/10 rounded-full w-fit mb-4">
									<feature.icon className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
								<p className="text-muted-foreground">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Workflow Section */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
						<div>
							<h2 className="text-3xl md:text-4xl font-bold mb-6">
								Tailored for Developer Workflows
							</h2>
							<p className="text-lg text-muted-foreground mb-8">
								DevCheck is designed specifically for software development
								teams. From planning sprints to deployment checklists, we've got
								you covered with workflows that adapt to your needs.
							</p>

							<div className="space-y-4">
								{[
									{
										icon: Code,
										title: "Development Templates",
										description:
											"Pre-built templates for common development workflows",
									},
									{
										icon: Database,
										title: "Integration Support",
										description:
											"Connect with tools like Notion, GitHub, and more",
									},
									{
										icon: Globe,
										title: "Cross-platform Access",
										description:
											"Use on any device with seamless synchronization",
									},
									{
										icon: Shield,
										title: "Secure and Private",
										description:
											"Enterprise-grade security for your sensitive project data",
									},
								].map((feature, index) => (
									<div key={index} className="flex items-start gap-3">
										<div className="p-1 bg-primary/10 rounded-full mt-1">
											<feature.icon className="h-4 w-4 text-primary" />
										</div>
										<div>
											<h3 className="font-medium">{feature.title}</h3>
											<p className="text-muted-foreground">
												{feature.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="lg:order-first">
							<img
								src="https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
								alt="Developer Workflow"
								className="rounded-lg shadow-xl"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-primary text-primary-foreground py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">
						Ready to Streamline Your Development Workflow?
					</h2>
					<p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
						Join thousands of developers who use DevCheck to manage their
						projects more efficiently.
					</p>
					<Link to="/register">
						<Button
							size="lg"
							variant="outline"
							className="font-semibold px-8 text-white text-primary"
						>
							Get Started for Free
						</Button>
					</Link>
				</div>
			</section>
		</SiteLayout>
	);
}

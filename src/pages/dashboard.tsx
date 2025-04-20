
import { Link } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, Plus, Activity, Clock, Users } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProjects } from "@/hooks/useProjects";

export default function DashboardPage() {
	const { user } = useAuth();
	const { data: projects, isLoading, error } = useProjects();

	// Calculate dashboard stats
	const totalProjects = projects?.length || 0;
	const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0;
	const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
	const publicProjects = projects?.filter(p => p.is_public).length || 0;

	// Get recent projects (up to 4)
	const recentProjects = projects?.slice(0, 4) || [];

	return (
		<>
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<Link to='/dashboard/projects/new'>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						New Project
					</Button>
				</Link>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Total Projects
						</CardTitle>
						<ListChecks className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalProjects}</div>
						<p className="text-xs text-muted-foreground">+2 from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Active Projects</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeProjects}</div>
						<p className="text-xs text-muted-foreground">+3 from yesterday</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Completed Projects
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{completedProjects}</div>
						<p className="text-xs text-muted-foreground">+8 from last week</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Public Projects
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{publicProjects}</div>
						<p className="text-xs text-muted-foreground">+1 from last month</p>
					</CardContent>
				</Card>
			</div>

			<div className="mt-8">
				<h2 className="text-xl font-bold mb-4">Recent Projects</h2>
				{isLoading ? (
					<div className="flex items-center justify-center h-40">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
					</div>
				) : error ? (
					<Card>
						<CardContent className="p-6">
							<p className="text-destructive">Failed to load projects. Please try again.</p>
						</CardContent>
					</Card>
				) : recentProjects.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{recentProjects.map((project) => (
							<Link key={project.id} to={`/dashboard/projects/${project.id}`}>
								<Card className="hover:bg-accent transition-colors">
									<CardHeader>
										<CardTitle>{project.name}</CardTitle>
										<CardDescription className="line-clamp-2">
											{project.description}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex items-center justify-between text-sm text-muted-foreground">
											<span>
												{new Date(project.created_at).toLocaleDateString()}
											</span>
											<span
												className={project.is_public ? "text-green-500" : ""}
											>
												{project.is_public ? "Public" : "Private"}
											</span>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				) : (
					<Card>
						<CardContent className="flex flex-col items-center justify-center p-6">
							<ListChecks className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-muted-foreground mb-4">
								You don't have any projects yet.
							</p>
							<Link to='/dashboard/projects/new'>
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Create Your First Project
								</Button>
							</Link>
						</CardContent>
					</Card>
				)}
			</div>
		</>
	);
}

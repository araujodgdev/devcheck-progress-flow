
import { useEffect, useState } from "react";
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
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export default function DashboardPage() {
	const { user } = useAuth();
	const [recentProjects, setRecentProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (user) {
			const fetchRecentProjects = async () => {
				try {
					const { data, error } = await supabase
						.from("projects")
						.select("*")
						.eq("user_id", user.id)
						.order("created_at", { ascending: false })
						.limit(4);

					if (error) throw error;
					setRecentProjects(data || []);
				} catch (error) {
					console.error("Error fetching recent projects:", error);
				} finally {
					setIsLoading(false);
				}
			};

			fetchRecentProjects();
		}
	}, [user]);

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
						<div className="text-2xl font-bold">{recentProjects.length}</div>
						<p className="text-xs text-muted-foreground">+2 from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground">+3 from yesterday</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Completed Tasks
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">28</div>
						<p className="text-xs text-muted-foreground">+8 from last week</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Shared Projects
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">3</div>
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
				) : recentProjects.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{recentProjects.map((project) => (
							<Link key={project.id} to={`/projects/${project.id}`}>
								<Card className="hover:bg-accent transition-colors">
									<CardHeader>
										<CardTitle>{project.title}</CardTitle>
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

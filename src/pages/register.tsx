import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteLayout } from "@/components/layouts/site-layout";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ListChecks } from "lucide-react";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { signUp } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await signUp(email, password);
			navigate("/login", {
				state: {
					message:
						"Account created! Please check your email to confirm your account.",
				},
			});
		} catch (error) {
			// Error is already handled in the auth context
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-12 flex flex-col items-center">
			<div className="w-full max-w-md">
				<div className="flex justify-center mb-8">
					<Link to="/" className="flex items-center gap-2">
						<ListChecks className="h-8 w-8" />
						<span className="font-bold text-2xl">DevCheck</span>
					</Link>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-2xl text-center">
							Create an Account
						</CardTitle>
						<CardDescription className="text-center">
							Sign up to start managing your development workflow
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="email@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={8}
								/>
								<p className="text-xs text-muted-foreground">
									Password must be at least 8 characters long
								</p>
							</div>
						</CardContent>
						<CardFooter className="flex-col gap-4">
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Creating account..." : "Create Account"}
							</Button>
							<p className="text-sm text-center text-muted-foreground">
								Already have an account?{" "}
								<Link to="/login" className="text-primary hover:underline">
									Login
								</Link>
							</p>
							<p className="text-xs text-center text-muted-foreground">
								By signing up, you agree to our{" "}
								<Link to="/terms" className="text-primary hover:underline">
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link to="/privacy" className="text-primary hover:underline">
									Privacy Policy
								</Link>
							</p>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}

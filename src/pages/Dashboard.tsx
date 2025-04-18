import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  const { data: projects, isLoading, error } = useProjects();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Meus Projetos</h1>
          <Button asChild>
            <Link to="/new-project" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Novo Projeto
            </Link>
          </Button>
        </div>

        {isLoading && <div>Carregando...</div>}
        {error && <div>Erro ao carregar projetos.</div>}

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Criado em: {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link to={`/projects/${project.id}`}>
                      Gerenciar Projeto
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

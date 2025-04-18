
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { TypeWriter } from "@/components/ui/type-writer";
import { ArrowRight, Bell, ChartLine, ChartNoAxesCombined, CheckCircle } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container pt-16 pb-12">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Gerencie seu progresso de desenvolvimento de forma{" "}
                  <TypeWriter
                    words={["inteligente", "eficiente", "produtiva", "organizada"]}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent"
                  />
                </h1>
                <p className="mx-auto max-w-[7  00px] text-muted-foreground md:text-xl">
                  Acompanhe seu progresso, organize suas tarefas e melhore sua produtividade 
                  com um sistema de checklist inteligente feito para desenvolvedores.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                <Button className="gap-2">
                  Começar agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32">
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
                  <h3 className="text-xl font-bold">Melhore sua produtividade</h3>
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

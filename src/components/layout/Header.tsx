
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
            DevCheck
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="relative transition-colors duration-200"
          aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <SunIcon className="h-5 w-5 transition-transform duration-200 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-5 w-5 transition-transform duration-200 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}

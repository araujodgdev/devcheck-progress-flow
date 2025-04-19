import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ListChecks, Bell, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/contexts/auth-context';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';

export function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const userEmail = user?.email || '';
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'U';

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <Link to="/" className="flex items-center gap-2 pb-6 pt-1.5">
                <ListChecks className="h-6 w-6" />
                <span className="font-bold">DevCheck</span>
              </Link>
            </div>
            <nav className="grid gap-2 px-2">
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
              </Link>
              <Link to="/projects">
                <Button variant="ghost" className="w-full justify-start">Projects</Button>
              </Link>
              <Link to="/templates">
                <Button variant="ghost" className="w-full justify-start">Templates</Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" className="w-full justify-start">Settings</Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link to="/" className="mr-6 flex items-center gap-2 md:hidden">
          <ListChecks className="h-6 w-6" />
          <span className="font-bold">DevCheck</span>
        </Link>
        <Link to="/" className="mr-6 hidden items-center gap-2 md:flex">
          <ListChecks className="h-6 w-6" />
          <span className="font-bold">DevCheck</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            />
            <Moon className="h-4 w-4" />
          </div>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
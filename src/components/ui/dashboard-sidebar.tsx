import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ListChecks, ListTodo, Settings, Plus } from 'lucide-react';

export function DashboardSidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex flex-col gap-2 p-4">
        <Link to="/projects/create">
          <Button className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>
      <nav className="grid gap-1 p-4 pt-0">
        <Link to="/dashboard">
          <Button
            variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-2',
              isActive('/dashboard') && 'font-medium'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <Link to="/projects">
          <Button
            variant={isActive('/projects') ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-2',
              isActive('/projects') && 'font-medium'
            )}
          >
            <ListChecks className="h-4 w-4" />
            Projects
          </Button>
        </Link>
        <Link to="/templates">
          <Button
            variant={isActive('/templates') ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-2',
              isActive('/templates') && 'font-medium'
            )}
          >
            <ListTodo className="h-4 w-4" />
            Templates
          </Button>
        </Link>
        <Link to="/settings">
          <Button
            variant={isActive('/settings') ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-2',
              isActive('/settings') && 'font-medium'
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </nav>
    </aside>
  );
}
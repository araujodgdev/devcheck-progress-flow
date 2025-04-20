import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Menu, X, ListChecks, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-sm shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <ListChecks className="h-6 w-6" />
          <span className="font-bold">DevCheck</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:underline underline-offset-4">
            Home
          </Link>
          <Link to="/features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link to="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link to="/docs" className="text-sm font-medium hover:underline underline-offset-4">
            Documentation
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            />
            <Moon className="h-4 w-4" />
          </div>
          
          {user ? (
            <Link to="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 pt-8">
                <Link to="/" className="flex items-center gap-2">
                  <ListChecks className="h-6 w-6" />
                  <span className="font-bold">DevCheck</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  <Link to="/" className="text-sm font-medium hover:underline underline-offset-4">
                    Home
                  </Link>
                  <Link to="/features" className="text-sm font-medium hover:underline underline-offset-4">
                    Features
                  </Link>
                  <Link to="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
                    Pricing
                  </Link>
                  <Link to="/docs" className="text-sm font-medium hover:underline underline-offset-4">
                    Documentation
                  </Link>
                  {user ? (
                    <Link to="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link to="/login" className="text-sm font-medium hover:underline underline-offset-4">
                        Login
                      </Link>
                      <Link to="/register" className="text-sm font-medium hover:underline underline-offset-4">
                        Sign Up
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
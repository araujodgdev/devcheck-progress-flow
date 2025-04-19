
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Routes from '@/routes';
import { AuthProvider } from '@/contexts/auth-context';
import { SupabaseProvider } from '@/contexts/supabase-context';

function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="devcheck-theme">
          <Routes />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default App;

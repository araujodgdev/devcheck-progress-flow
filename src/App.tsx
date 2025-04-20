
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Routes from '@/routes';
import { AuthProvider } from '@/contexts/auth-context';
import { SupabaseProvider } from '@/contexts/supabase-context';
import { QueryProvider } from '@/providers/query-provider';

function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <QueryProvider>
          <ThemeProvider defaultTheme="dark" storageKey="devcheck-theme">
            <Routes />
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default App;

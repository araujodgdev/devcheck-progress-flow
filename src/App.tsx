import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from '@/routes';
import { AuthProvider } from '@/contexts/auth-context';
import { SupabaseProvider } from '@/contexts/supabase-context';

function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="devcheck-theme">
          <AppRoutes />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default App;

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import Register from './pages/register';
import DashboardLayout from './components/layouts/dashboard-layout';
import SiteLayout from './components/layouts/site-layout';
import ProjectDetails from './pages/ProjectDetails';
import NewProject from './pages/NewProject';
import ChecklistDetails from './pages/ChecklistDetails';
import SharedChecklist from './pages/SharedChecklist';
import { AuthProvider } from './components/AuthProvider';
import { SupabaseProvider } from './contexts/supabase-context';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/theme-provider';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
    ],
  },
  { path: '/projects/new', element: <NewProject /> },
  { path: '/projects/:projectId', element: <ProjectDetails /> },
  { path: '/projects/:projectId/checklists/:checklistId', element: <ChecklistDetails /> },
  { path: '/shared/checklist/:publicId', element: <SharedChecklist /> },
]);

export default function Routes() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <SupabaseProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}

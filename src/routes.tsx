
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import Register from './pages/register';
import { DashboardLayout } from './components/layouts/dashboard-layout';
import { SiteLayout } from './components/layouts/site-layout';
import ProjectDetails from './pages/ProjectDetails';
import NewProject from './pages/NewProject';
import ChecklistDetails from './pages/ChecklistDetails';
import SharedChecklist from './pages/SharedChecklist';
import { ThemeProvider } from './components/theme-provider';
import { SupabaseProvider } from './contexts/supabase-context';
import { AuthProvider } from './contexts/auth-context';
import { Toaster } from './components/ui/toaster';
import NewChecklist from './pages/NewChecklist';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout><Outlet /></SiteLayout>,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout><Outlet /></DashboardLayout>,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/dashboard/projects/new', element: <NewProject /> },
      { path: '/dashboard/projects/:projectId', element: <ProjectDetails /> },
      { path: '/dashboard/projects/:projectId/checklists/:checklistId', element: <ChecklistDetails /> },
      { path: '/dashboard/projects/:projectId/checklists/new', element: <NewChecklist /> },
    ],

  },
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


import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

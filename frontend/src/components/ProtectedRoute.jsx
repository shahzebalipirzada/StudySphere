import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }) {
  const { user, accessToken } = useAuthStore();

  const isAuthenticated = !!user && !!accessToken;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
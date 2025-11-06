import { Navigate } from 'react-router-dom';
import { isCurrentUserAdmin, isAuthenticated } from '../services/authService';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  // Verificar autenticación primero
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permisos de administrador
  if (!isCurrentUserAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
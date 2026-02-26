import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { isAutenticado } = useAuth();

  if (!isAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

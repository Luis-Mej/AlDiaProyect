import { useAuthStore } from '../store';

export const useAuth = () => {
  const { usuario, token, setUsuario, logout } = useAuthStore();
  
  return {
    usuario,
    token,
    setUsuario,
    logout,
    isAutenticado: !!token && !!usuario,
  };
};

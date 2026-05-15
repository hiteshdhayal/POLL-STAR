import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';
import type { User } from '../types';

export const useAuth = () => {
  const { user, setAuth, logout: storeLogout } = useAuthStore();

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    setAuth(data.user as User);
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      storeLogout();
    }
  };

  return { user, isAuthenticated, login, logout };
};

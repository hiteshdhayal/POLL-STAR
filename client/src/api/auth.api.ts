import { api } from './axios';
import type { User } from '../types';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; }

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<{ success: boolean; message: string }>('/auth/register', data),

  verifyEmail: (token: string) =>
    api.post<{ success: boolean; user: User }>('/auth/verify-email', { token }),

  login: (data: LoginPayload) =>
    api.post<{ success: boolean; user: User }>('/auth/login', data),

  refresh: () =>
    api.post<{ success: boolean }>('/auth/refresh'),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<{ success: boolean; user: User }>('/auth/me'),

  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },
};

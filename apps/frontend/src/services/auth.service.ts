import { api } from './api';
import { ApiResponse } from '@/types/api.types';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/user.types';

export const authService = {
  async register(payload: RegisterPayload): Promise<User> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return res.data.data.user;
  },

  async login(payload: LoginPayload): Promise<User> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return res.data.data.user;
  },

  async refreshToken(): Promise<User> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/refresh-token');
    return res.data.data.user;
  },

  async logout(): Promise<void> {
    await api.post<ApiResponse<null>>('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  async getProfile(): Promise<User> {
    const res = await api.get<ApiResponse<AuthResponse>>('/auth/me');
    return res.data.data.user;
  },
};

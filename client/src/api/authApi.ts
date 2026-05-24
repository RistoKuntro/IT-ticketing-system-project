import api from './axiosInstance';
import { AuthUser } from '../types';

export const login = async (credentials: any) => {
  const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/login', credentials);
  return data;
};

export const register = async (userData: any) => {
  const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/register', userData);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
};

export const updateMe = async (payload: { name?: string; email?: string; phone?: string }) => {
  const { data } = await api.put('/auth/me', payload);
  return data;
};

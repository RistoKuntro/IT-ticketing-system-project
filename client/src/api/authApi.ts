import api from './axiosInstance';
import { AuthUser } from '../types';

export const login = async (credentials: any) => {
  const { data } = await api.post<{token: string, user: AuthUser}>('/auth/login', credentials);
  return data;
};

export const register = async (userData: any) => {
  const { data } = await api.post<{token: string, user: AuthUser}>('/auth/register', userData);
  return data;
};

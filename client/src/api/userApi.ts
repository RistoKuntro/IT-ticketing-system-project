import api from './axiosInstance';
import { User } from '../types';

export const getUsers = async () => {
  const { data } = await api.get<{ users: User[] }>('/users');
  return data;
};

export const updateUserRole = async (userId: number, role: 'admin' | 'user') => {
  const { data } = await api.patch<{ user: User }>(`/users/${userId}/role`, { role });
  return data;
};

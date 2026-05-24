import api from './axiosInstance';
import { User } from '../types';

export const getUsers = async () => {
  const { data } = await api.get<{ users: User[] }>('/users');
  return data;
};

export const getSpecialists = async () => {
  const { data } = await api.get<{ users: User[] }>('/users/specialists');
  return data;
};

export const updateUserRole = async (userId: number, role: 'admin' | 'specialist' | 'user') => {
  const { data } = await api.put<{ user: User }>(`/users/${userId}/role`, { role });
  return data;
};

export const deleteUser = async (userId: number) => {
  const { data } = await api.delete<{ message: string }>(`/users/${userId}`);
  return data;
};

export const updateUser = async (
  userId: number,
  payload: { name?: string; email?: string; phone?: string | null; role?: 'admin' | 'specialist' | 'user' }
) => {
  const { data } = await api.put<{ user: User }>(`/users/${userId}`, payload);
  return data;
};

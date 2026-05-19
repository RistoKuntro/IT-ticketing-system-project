import api from './axiosInstance';
import { User } from '../types';

export const getUsers = async () => {
  const { data } = await api.get<User[]>('/users');
  return data;
};

import api from './axiosInstance';
import { Ticket, Solution } from '../types';

export const getTickets = async () => {
  const { data } = await api.get<Ticket[]>('/tickets');
  return data;
};

export const getTicket = async (id: number) => {
  const { data } = await api.get<Ticket>(`/tickets/${id}`);
  return data;
};

export const createTicket = async (ticketData: any) => {
  const { data } = await api.post<Ticket>('/tickets', ticketData);
  return data;
};

export const updateTicket = async (id: number, ticketData: any) => {
  const { data } = await api.patch<Ticket>(`/tickets/${id}`, ticketData);
  return data;
};

export const addSolution = async (ticketId: number, solutionData: any) => {
  const { data } = await api.post<Solution>(`/tickets/${ticketId}/solutions`, solutionData);
  return data;
};

export const deleteSolution = async (ticketId: number, solutionId: number) => {
  const { data } = await api.delete<Solution>(`/tickets/${ticketId}/solutions/${solutionId}`);
  return data;
};

export const deleteTicket = async (id: number) => {
  const { data } = await api.delete<Ticket>(`/tickets/${id}`);
  return data;
};

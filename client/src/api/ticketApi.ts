import api from './axiosInstance';
import { Ticket, Solution } from '../types';

export const getTickets = async (params?: any) => {
  const { data } = await api.get<{ tickets: Ticket[]; total: number }>('/tickets', { params });
  return data;
};

export const getTicket = async (id: number) => {
  const { data } = await api.get<{ ticket: Ticket }>(`/tickets/${id}`);
  return data.ticket;
};

export const createTicket = async (ticketData: any) => {
  const { data } = await api.post<{ ticket: Ticket }>('/tickets', ticketData);
  return data.ticket;
};

export const updateTicket = async (id: number, ticketData: any) => {
  const { data } = await api.put<{ ticket: Ticket }>(`/tickets/${id}`, ticketData);
  return data.ticket;
};

export const addSolution = async (ticketId: number, solutionData: any) => {
  const { data } = await api.post<{ solution: Solution }>(`/tickets/${ticketId}/solutions`, solutionData);
  return data.solution;
};

export const deleteSolution = async (ticketId: number, solutionId: number) => {
  const { data } = await api.delete<Solution>(`/tickets/${ticketId}/solutions/${solutionId}`);
  return data;
};

export const deleteTicket = async (id: number) => {
  const { data } = await api.delete<Ticket>(`/tickets/${id}`);
  return data;
};

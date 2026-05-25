import api from './axiosInstance';
import { Ticket, TicketResponse } from '../types';

export const getTickets = async (params?: any) => {
  const { data } = await api.get<{ tickets: Ticket[]; total: number }>('/tickets', { params });
  return data;
};

export const getTicket = async (id: number) => {
  const { data } = await api.get<{ ticket: Ticket }>(`/tickets/${id}`);
  return data.ticket;
};

export const getArchived = async () => {
  const { data } = await api.get<{ tickets: Ticket[] }>('/tickets/archived');
  return data.tickets;
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
  const { data } = await api.post<{ ticketResponse: TicketResponse }>(`/tickets/${ticketId}/solutions`, solutionData);
  return data.ticketResponse;
};

export const addFeedback = async (ticketId: number, feedbackData: { rating: number; comment?: string }) => {
  const { data } = await api.post<{ feedback: unknown }>(`/tickets/${ticketId}/feedback`, feedbackData);
  return data.feedback;
};

export const deleteSolution = async (ticketId: number, solutionId: number) => {
  const { data } = await api.delete<{ message: string }>(`/tickets/${ticketId}/solutions/${solutionId}`);
  return data;
};

export const deleteTicket = async (id: number) => {
  const { data } = await api.delete<Ticket>(`/tickets/${id}`);
  return data;
};

export const assignSpecialist = async (ticketId: number, specialistId: number) => {
  const { data } = await api.post<{ message: string }>(`/tickets/${ticketId}/assign/${specialistId}`);
  return data;
};

export const removeAssignment = async (ticketId: number, specialistId: number) => {
  const { data } = await api.delete<{ message: string }>(`/tickets/${ticketId}/assign/${specialistId}`);
  return data;
};

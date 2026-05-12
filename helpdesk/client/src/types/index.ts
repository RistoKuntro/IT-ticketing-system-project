export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export type TicketStatus = "open" | "in_progress" | "closed" | "cancelled";
export type Priority = "low" | "medium" | "high";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  creator: User;
  assignee: User | null;
  createdAt: string;
  updatedAt: string;
  solutions: Solution[];
}

export interface Solution {
  id: number;
  content: string;
  author: User;
  createdAt: string;
  ticketId: number;
}
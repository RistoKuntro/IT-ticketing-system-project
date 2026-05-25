export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  createdAt: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
}

export type TicketStatus = "open" | "in_progress" | "closed" | "archived" | "cancelled";
export type Priority = "none" | "low" | "medium" | "high";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  creator: User;
  assignments?: { specialist: User; assignedAt: string }[];
  isArchived?: boolean;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  responses?: TicketResponse[];
  feedbacks?: Feedback[];
}

export interface TicketResponse {
  id: number;
  content: string;
  author: User;
  createdAt: string;
  ticketId: number;
}

export interface Feedback {
  id: number;
  ticketId: number;
  userId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
}
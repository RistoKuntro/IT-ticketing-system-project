// client/src/components/TicketCard.tsx
import React from "react";
import Badge from "./Badge";
import { Ticket } from "../types";

interface TicketCardProps {
  ticket: Ticket;
  isAdmin: boolean;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export default function TicketCard({ ticket, isAdmin, onView, onDelete }: TicketCardProps) {
  return (
    <div className="ticket-card">
      <div className="ticket-card-header">
        <h3 className="ticket-title">{ticket.title}</h3>
        <div className="ticket-badges">
          <Badge label={ticket.status} variant="status" />
          <Badge label={ticket.priority} variant="priority" />
        </div>
      </div>
      <p className="ticket-description">{truncate(ticket.description, 120)}</p>
      <div className="ticket-card-footer">
        <div className="ticket-meta">
          <span>👤 {ticket.creator.name}</span>
          <span>📅 {new Date(ticket.createdAt).toLocaleDateString("et-EE")}</span>
          {ticket.assignee && <span>🔧 {ticket.assignee.name}</span>}
          {ticket.solutions.length > 0 && (
            <span>
              💬 {ticket.solutions.length} lahendus{ticket.solutions.length !== 1 ? "t" : ""}
            </span>
          )}
        </div>
        <div className="ticket-actions">
          {isAdmin && (
            <button onClick={() => onDelete(ticket.id)} className="btn btn-danger btn-sm">
              Kustuta
            </button>
          )}
          <button onClick={() => onView(ticket.id)} className="btn btn-primary btn-sm">
            Vaata →
          </button>
        </div>
      </div>
    </div>
  );
}

/* LISA index.css-i:
.ticket-card { background:white; border-radius:10px; padding:1.25rem; border:1px solid #e5e7eb; transition:box-shadow 0.2s; }
.ticket-card:hover { box-shadow:0 4px 12px rgba(0,0,0,0.08); }
.ticket-card-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:0.5rem; }
.ticket-title { font-size:1rem; font-weight:600; color:#1a1a2e; flex:1; margin:0; }
.ticket-badges { display:flex; gap:0.375rem; flex-shrink:0; flex-wrap:wrap; }
.ticket-description { font-size:0.875rem; color:#6b7280; margin-bottom:1rem; line-height:1.5; }
.ticket-card-footer { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; }
.ticket-meta { display:flex; gap:1rem; font-size:0.75rem; color:#9ca3af; flex-wrap:wrap; }
.ticket-actions { display:flex; gap:0.5rem; }
.btn-sm { padding:6px 12px !important; font-size:0.8rem !important; }
*/
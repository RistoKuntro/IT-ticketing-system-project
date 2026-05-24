// client/src/components/TicketCard.tsx
import { Badge } from "./Badge";
import { Ticket } from "../types";

interface TicketCardProps {
  ticket: Ticket;
  isAdmin: boolean;
  isSpecialist?: boolean;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export default function TicketCard({ ticket, isAdmin, isSpecialist, onView, onDelete }: TicketCardProps) {
  const canManageAll = isAdmin || isSpecialist;
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
          {canManageAll && (
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


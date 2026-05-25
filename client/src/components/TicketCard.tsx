// client/src/components/TicketCard.tsx
import { Badge } from "./Badge";
import { Ticket } from "../types";

interface TicketCardProps {
  ticket: Ticket;
  isAdmin: boolean;
  isSpecialist?: boolean;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  canView?: boolean;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export default function TicketCard({ ticket, isAdmin, onView, onDelete, canView = true }: TicketCardProps) {
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
          {ticket.creator.email && <span>✉️ {ticket.creator.email}</span>}
          {ticket.creator.phone && <span>📞 {ticket.creator.phone}</span>}
          <span>📅 {new Date(ticket.createdAt).toLocaleDateString("et-EE")}</span>
          {ticket.assignments && ticket.assignments.length > 0 && <span>🔧 {ticket.assignments.map(a => `${a.specialist.name}${a.specialist.phone ? ' ('+a.specialist.phone+')' : ''}`).join(', ')}</span>}
          {ticket.responses && ticket.responses.length > 0 && (
            <span>
              💬 {ticket.responses.length} vastus{ticket.responses.length !== 1 ? "ed" : ""}
            </span>
          )}
        </div>
        <div className="ticket-actions">
          {isAdmin && (
            <button onClick={() => onDelete(ticket.id)} className="btn btn-danger btn-sm">
              Kustuta
            </button>
          )}
          <button onClick={() => onView(ticket.id)} className="btn btn-primary btn-sm" disabled={!canView}>
            Vaata →
          </button>
        </div>
      </div>
    </div>
  );
}


import React, { useEffect, useState } from 'react';
import { Ticket } from '../types';
import { getArchived } from '../api/ticketApi';
import TicketCard from '../components/TicketCard';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const ArchivePage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, isSpecialist, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getArchived()
      .then((res) => setTickets(res.filter((ticket) => ticket.status === 'archived')))
      .catch(() => setError('Viga arhiiivide laadimisel'))
      .finally(() => setLoading(false));
  }, [isAdmin, isSpecialist]);

  return (
    <div className="main-container">
      <div className="page-header">
        <div>
          <h1>Arhiiv</h1>
          <p className="page-subtitle">Siin näed vanu ja lahendatud pileteid</p>
        </div>
      </div>

      {loading && <div className="alert">Laadin...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && tickets.length === 0 && (
        <div className="empty-state">
          <p>🎉 Arhiiv tühi</p>
        </div>
      )}

      <div className="tickets-list">
        {tickets.map(t => (
          <TicketCard
            key={t.id}
            ticket={t}
            isAdmin={isAdmin}
            isSpecialist={isSpecialist}
            onView={(id) => navigate(`/tickets/${id}`)}
            onDelete={() => {}}
            canView={isAdmin || isSpecialist || (user != null && t.creator?.id === user.id)}
          />
        ))}
      </div>
    </div>
  );
};

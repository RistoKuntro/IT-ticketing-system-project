import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTickets } from "../hooks/useTickets";
import Modal from "../components/Modal";
import TicketForm from "../components/TicketForm";
import TicketCard from "../components/TicketCard";

export default function DashboardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [localSearch, setLocalSearch] = useState<string>("");

  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { tickets, total, isLoading, error, filters, loadTickets, createTicket, deleteTicket, changeFilters, resetFilters } = useTickets();

  useEffect(() => {
    loadTickets({
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      search: filters.search || undefined,
    });
  }, [filters.status, filters.priority, filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => changeFilters({ search: localSearch }), 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  async function handleCreate(data: { title: string; description: string; priority: string }) {
    setCreateError(null);
    try {
      await createTicket(data);
      setIsCreateOpen(false);
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Viga pileti loomisel");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTicket(id);
    } finally {
      setDeleteConfirmId(null);
    }
  }

  function handleFilterChange(key: "status" | "priority" | "search", value: string) {
    if (key === "search") setLocalSearch(value);
    else changeFilters({ [key]: value });
  }

  function handleClearFilters() {
    resetFilters();
    setLocalSearch("");
  }

  return (
    <div className="main-container">
      {/* 1. Päis */}
      <div className="page-header">
        <div>
          <h1>{isAdmin ? "Kõik piletid" : "Minu piletid"}</h1>
          <p className="page-subtitle">
            {isAdmin ? "Halda kõiki tugipiletteid" : "Vaata ja halda oma tugipiletteid"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          + Uus pilet
        </button>
      </div>

      {/* 2. Filtrid */}
      <div className="filter-bar">
        <div className="filter-controls">
          <input
            type="text"
            className="input filter-search"
            placeholder="Otsi piletit..."
            value={localSearch}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <select
            className="input filter-select"
            value={filters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">Kõik staatused</option>
            <option value="open">Avatud</option>
            <option value="in_progress">Pooleli</option>
            <option value="closed">Suletud</option>
            <option value="cancelled">Tühistatud</option>
          </select>
          <select
            className="input filter-select"
            value={filters.priority || ""}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
          >
            <option value="">Kõik prioriteedid</option>
            <option value="low">Madal</option>
            <option value="medium">Keskmine</option>
            <option value="high">Kõrge</option>
          </select>
          {(filters.status || filters.priority || filters.search) && (
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Tühjenda
            </button>
          )}
        </div>
        <div className="filter-count">
          {total} pilet{total !== 1 ? "it" : ""}
        </div>
      </div>

      {/* 3. Viga ja laadimine */}
      {error && <div className="alert alert-error">{error}</div>}
      {isLoading && <div className="alert">Laadin piletteid...</div>}

      {/* 4. Tühi olek */}
      {!isLoading && tickets.length === 0 && (
        <div className="empty-state">
          <p>🎉 Pileteid ei leitud</p>
          <p className="empty-subtitle">
            {filters.status || filters.priority || filters.search
              ? "Proovi filtreid muuta"
              : "Loo esimene pilet nupuga \"+ Uus pilet\""}
          </p>
        </div>
      )}

      {/* 5. Piletite nimekiri */}
      {!isLoading && tickets.length > 0 && (
        <div className="tickets-list">
          {tickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              isAdmin={isAdmin}
              onView={(id) => navigate(`/tickets/${id}`)}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      )}

      {/* 6. Uue pileti modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setCreateError(null); }}
        title="Loo uus pilet"
      >
        {createError && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {createError}
          </div>
        )}
        <TicketForm
          onSubmit={handleCreate}
          onCancel={() => { setIsCreateOpen(false); setCreateError(null); }}
        />
      </Modal>

      {/* 7. Kustutamise kinnitus modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Kinnita kustutamine"
        maxWidth={400}
      >
        <p style={{ marginBottom: "1.5rem" }}>
          Kas oled kindel, et soovid pileti kustutada? Seda ei saa tagasi võtta.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
            Tühista
          </button>
          <button className="btn btn-danger" onClick={() => { if (deleteConfirmId !== null) handleDelete(deleteConfirmId); }}>
            Kustuta
          </button>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTickets } from "../hooks/useTickets";
import { Badge } from "../components/Badge";
import { FormField } from "../components/FormField";
import { getUsers } from "../api/userApi";
import { deleteSolution } from "../api/ticketApi";
import { User } from "../types";

export const TicketDetailPage = () => {
  const [solutionContent, setSolutionContent] = useState<string>("");
  const [solutionError, setSolutionError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { selectedTicket, isLoading, error, loadTicket, updateTicket, createSolution, clearTicket } = useTickets();

  useEffect(() => {
    if (id) loadTicket(Number(id));
    return () => clearTicket();
  }, [id]);

  useEffect(() => {
    if (!isAdmin) return;
    getUsers()
      .then(res => setUsers(res))
      .catch(() => {});
  }, [isAdmin]);

  async function handleStatusChange(status: string) {
    try {
      await updateTicket(Number(id), { status });
      setUpdateError(null);
    } catch (e: unknown) {
      setUpdateError(e instanceof Error ? e.message : "Viga uuendamisel");
    }
  }

  async function handleAssigneeChange(value: string) {
    const assigneeId = value ? Number(value) : null;
    try {
      await updateTicket(Number(id), { assigneeId });
      setUpdateError(null);
    } catch (e: unknown) {
      setUpdateError(e instanceof Error ? e.message : "Viga uuendamisel");
    }
  }

  async function handleAddSolution(e: React.FormEvent) {
    e.preventDefault();
    if (solutionContent.trim().length < 10) {
      setSolutionError("Lahendus peab olema vähemalt 10 tähemärki");
      return;
    }
    try {
      await createSolution(Number(id), solutionContent.trim());
      setSolutionContent("");
      setSolutionError(null);
    } catch (e: unknown) {
      setSolutionError(e instanceof Error ? e.message : "Viga lahenduse lisamisel");
    }
  }

  async function handleDeleteSolution(solutionId: number) {
    try {
      await deleteSolution(Number(id), solutionId);
      loadTicket(Number(id));
    } catch {
      /* ignoreeri */
    }
  }

  async function handleCancelTicket() {
    try {
      await updateTicket(Number(id), { status: "cancelled" });
    } catch (e: unknown) {
      setUpdateError(e instanceof Error ? e.message : "Viga tühistamisel");
    }
  }

  return (
    <div className="main-container">
      {/* Tagasi nupp */}
      <button className="btn btn-secondary" onClick={() => navigate("/dashboard")} style={{ marginBottom: "1.5rem" }}>
        ← Tagasi
      </button>

      {/* Olek */}
      {isLoading && <div className="alert">Laadin piletit...</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {updateError && <div className="alert alert-error">{updateError}</div>}

      {/* Sisu — kuva ainult kui selectedTicket on olemas */}
      {selectedTicket && (
        <div className="ticket-detail-wrapper">
          {/* Päis */}
          <div className="ticket-detail-header">
            <div>
              <h1 className="ticket-detail-title">{selectedTicket.title}</h1>
              <div className="ticket-detail-meta">
                <span>#{selectedTicket.id}</span>
                <span>Looja: {selectedTicket.creator.name}</span>
                <span title={new Date(selectedTicket.createdAt).toLocaleString("et-EE")}>
                  Loodud: {new Date(selectedTicket.createdAt).toLocaleString("et-EE", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
            </div>
            <div className="ticket-badges">
              <Badge label={selectedTicket.status} variant="status" />
              <Badge label={selectedTicket.priority} variant="priority" />
            </div>
          </div>

          {/* Kaheveeruline keha */}
          <div className="ticket-detail-body">
            {/* VASAK: kirjeldus + lahendused + lahenduse vorm */}
            <div className="ticket-detail-main">
              {/* Kirjeldus */}
              <div className="detail-section">
                <h2>Kirjeldus</h2>
                <div style={{ whiteSpace: "pre-wrap", color: "#4b5563", lineHeight: 1.6 }}>
                  {selectedTicket.description}
                </div>
              </div>

              {/* Lahendused */}
              <div className="detail-section">
                <h2>Lahendused ({selectedTicket.solutions.length})</h2>

                {selectedTicket.solutions.length === 0 && (
                  <p style={{ color: "#6b7280", fontStyle: "italic", margin: 0 }}>
                    Lahendusi pole veel lisatud.
                  </p>
                )}

                {selectedTicket.solutions.map(solution => (
                  <div key={solution.id} className="solution-item">
                    <div className="solution-header">
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <div className="solution-avatar">
                          {solution.author.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1f2937" }}>
                            {solution.author.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {new Date(solution.createdAt).toLocaleString("et-EE", { dateStyle: "medium", timeStyle: "short" })}
                          </div>
                        </div>
                      </div>
                      {isAdmin && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSolution(solution.id)}>
                          Kustuta
                        </button>
                      )}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", color: "#374151" }}>
                      {solution.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lahenduse lisamine — ainult admin */}
              {isAdmin && (
                <div className="detail-section">
                  <h2>Lisa lahendus</h2>
                  {solutionError && (
                    <div className="alert alert-error">{solutionError}</div>
                  )}
                  <form onSubmit={handleAddSolution}>
                    <textarea
                      className="input"
                      rows={4}
                      value={solutionContent}
                      onChange={e => { setSolutionContent(e.target.value); setSolutionError(null); }}
                      placeholder="Kirjelda lahendust..."
                      style={{ resize: "vertical", width: "100%", marginBottom: "0.75rem" }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!solutionContent.trim()}>
                      Lisa lahendus
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* info + admin haldus + kasutaja tühistamine */}
            <div className="ticket-detail-sidebar">
              {/* Info kaart */}
              <div className="sidebar-card">
                <h3>Pileti info</h3>
                <dl className="info-list">
                  <dt>Staatus</dt>
                  <dd><Badge label={selectedTicket.status} variant="status" /></dd>
                  <dt>Prioriteet</dt>
                  <dd><Badge label={selectedTicket.priority} variant="priority" /></dd>
                  <dt>Töötaja</dt>
                  <dd style={{ color: selectedTicket.assignee ? "#374151" : "#9ca3af", fontStyle: selectedTicket.assignee ? "normal" : "italic" }}>
                    {selectedTicket.assignee ? selectedTicket.assignee.name : "Määramata"}
                  </dd>
                  <dt>Uuendatud</dt>
                  <dd>
                    {new Date(selectedTicket.updatedAt).toLocaleString("et-EE", { dateStyle: "short", timeStyle: "short" })}
                  </dd>
                </dl>
              </div>

              {/* Admin haldus */}
              {isAdmin && (
                <div className="sidebar-card">
                  <h3>Halda piletit</h3>
                  <FormField label="Staatus">
                    <select
                      className="input"
                      value={selectedTicket.status}
                      onChange={e => handleStatusChange(e.target.value)}
                    >
                      <option value="open">Avatud</option>
                      <option value="in_progress">Pooleli</option>
                      <option value="closed">Suletud</option>
                      <option value="cancelled">Tühistatud</option>
                    </select>
                  </FormField>
                  <div style={{ marginTop: "0.75rem" }}>
                    <FormField label="Töötaja">
                      <select
                        className="input"
                        value={selectedTicket.assignee?.id?.toString() ?? ""}
                        onChange={e => handleAssigneeChange(e.target.value)}
                      >
                        <option value="">Määramata</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id.toString()}>{u.name}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                </div>
              )}

              {/* Kasutaja tühistamine */}
              {!isAdmin && selectedTicket.status === "open" && selectedTicket.creator.id === user?.id && (
                <div className="sidebar-card">
                  <h3>Tegevused</h3>
                  <button className="btn btn-danger" style={{ width: "100%" }} onClick={handleCancelTicket}>
                    Tühista pilet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

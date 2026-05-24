import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTickets } from "../hooks/useTickets";
import { Badge } from "../components/Badge";
import { FormField } from "../components/FormField";
import { getSpecialists } from "../api/userApi";
import { addFeedback, deleteSolution } from "../api/ticketApi";
import { User } from "../types";

export const TicketDetailPage = () => {
  const [solutionContent, setSolutionContent] = useState<string>("");
  const [solutionError, setSolutionError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [specialists, setSpecialists] = useState<User[]>([]);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isSpecialist } = useAuth();
  const canManageAll = isAdmin || isSpecialist;
  const { selectedTicket, isLoading, error, loadTicket, updateTicket, createSolution, clearTicket } = useTickets();

  useEffect(() => {
    if (id) loadTicket(Number(id));
    return () => clearTicket();
  }, [id]);

  useEffect(() => {
    if (!canManageAll) return;
    getSpecialists()
      .then(res => setSpecialists(res.users))
      .catch(() => {});
  }, [canManageAll]);

  const [selectedSpecialist, setSelectedSpecialist] = useState<number | null>(null);

  async function handleAssignSpecialist() {
    if (!selectedSpecialist) return;
    try {
      await (await import('../api/ticketApi')).assignSpecialist(Number(id), selectedSpecialist);
      await loadTicket(Number(id));
      setSelectedSpecialist(null);
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : 'Viga määramisel');
    }
  }

  async function handleRemoveAssignment(specialistId: number) {
    try {
      await (await import('../api/ticketApi')).removeAssignment(Number(id), specialistId);
      await loadTicket(Number(id));
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : 'Viga eemaldamisel');
    }
  }

  async function handleStatusChange(status: string) {
    try {
      await updateTicket(Number(id), { status });
      setUpdateError(null);
    } catch (e: unknown) {
      setUpdateError(e instanceof Error ? e.message : "Viga uuendamisel");
    }
  }

  // assignment management moved to specialist assignment flow (not editable here)

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

  async function handleAddFeedback(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedTicket) return;

    try {
      await addFeedback(selectedTicket.id, {
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      });
      setFeedbackError(null);
      setFeedbackComment("");
      await loadTicket(selectedTicket.id);
    } catch (e: unknown) {
      setFeedbackError(e instanceof Error ? e.message : "Viga tagasiside lisamisel");
    }
  }

  const assignedSpecialistIds = new Set(selectedTicket?.assignments?.map(a => a.specialist.id) ?? []);
  const isAssignedToTicket = !!user && assignedSpecialistIds.has(user.id);
  const canAssignSpecialist = !!selectedTicket && (isAdmin || (isSpecialist && isAssignedToTicket));
  const availableSpecialists = specialists.filter(specialist => !assignedSpecialistIds.has(specialist.id));
  const hasFeedbackFromCurrentUser = !!selectedTicket?.feedbacks?.some(fb => fb.userId === user?.id);

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
                <span>Email: <a href={`mailto:${selectedTicket.creator.email}`}>{selectedTicket.creator.email}</a></span>
                {selectedTicket.creator.phone && <span>Tel: <a href={`tel:${selectedTicket.creator.phone}`}>{selectedTicket.creator.phone}</a></span>}
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

              {/* Lahendused / vastused */}
              <div className="detail-section">
                <h2>Vastused ({selectedTicket.responses?.length ?? 0})</h2>

                {(selectedTicket.responses ?? []).length === 0 && (
                  <p style={{ color: "#6b7280", fontStyle: "italic", margin: 0 }}>
                    Vastuseid pole veel lisatud.
                  </p>
                )}

                {(selectedTicket.responses ?? []).map(response => (
                  <div key={response.id} className="solution-item">
                    <div className="solution-header">
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <div className="solution-avatar">
                          {response.author.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1f2937" }}>
                            {response.author.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {new Date(response.createdAt).toLocaleString("et-EE", { dateStyle: "medium", timeStyle: "short" })}
                          </div>
                        </div>
                      </div>
                      {(canManageAll || user?.id === response.author.id) && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSolution(response.id)}>
                          Kustuta
                        </button>
                      )}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", color: "#374151" }}>
                      {response.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lahenduse lisamine — admin või spetsialist */}
              {canManageAll && (
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

              {selectedTicket.status === "closed" && !selectedTicket.isArchived && selectedTicket.creator.id === user?.id && !hasFeedbackFromCurrentUser && (
                <div className="detail-section">
                  <h2>Anna tagasisidet</h2>
                  {feedbackError && <div className="alert alert-error">{feedbackError}</div>}
                  <form onSubmit={handleAddFeedback}>
                    <FormField label="Hinnang">
                      <select className="input" value={feedbackRating} onChange={e => setFeedbackRating(Number(e.target.value))}>
                        <option value={5}>5 - Väga hea</option>
                        <option value={4}>4 - Hea</option>
                        <option value={3}>3 - Rahuldav</option>
                        <option value={2}>2 - Kehv</option>
                        <option value={1}>1 - Väga kehv</option>
                      </select>
                    </FormField>
                    <FormField label="Kommentaar">
                      <textarea
                        className="input"
                        rows={4}
                        value={feedbackComment}
                        onChange={e => setFeedbackComment(e.target.value)}
                        placeholder="Kirjuta lühike tagasiside..."
                      />
                    </FormField>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
                      Saada tagasiside
                    </button>
                  </form>
                </div>
              )}

              {selectedTicket.status === "closed" && !selectedTicket.isArchived && selectedTicket.creator.id === user?.id && hasFeedbackFromCurrentUser && (
                <div className="detail-section">
                  <h2>Tagasiside antud</h2>
                  <p style={{ margin: 0, color: "#6b7280" }}>Sellele piletil on juba sinu tagasiside olemas.</p>
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
                  <dt>Töötajad</dt>
                  <dd style={{ color: selectedTicket.assignments && selectedTicket.assignments.length > 0 ? "#374151" : "#9ca3af", fontStyle: selectedTicket.assignments && selectedTicket.assignments.length > 0 ? "normal" : "italic" }}>
                    {selectedTicket.assignments && selectedTicket.assignments.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {selectedTicket.assignments.map(a => (
                          <div key={a.specialist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{a.specialist.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                <a href={`mailto:${a.specialist.email}`}>{a.specialist.email}</a>
                                {a.specialist.phone && <span> • <a href={`tel:${a.specialist.phone}`}>{a.specialist.phone}</a></span>}
                              </div>
                            </div>
                            <div>
                              {(isAdmin || isSpecialist) && (
                                <button className="btn btn-sm btn-secondary" onClick={() => handleRemoveAssignment(a.specialist.id)}>Eemalda</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      'Määramata'
                    )}
                  </dd>
                  <dt>Uuendatud</dt>
                  <dd>
                    {new Date(selectedTicket.updatedAt).toLocaleString("et-EE", { dateStyle: "short", timeStyle: "short" })}
                  </dd>
                </dl>
              </div>

              {/* Admin ja spetsialisti haldus */}
              {canManageAll && (
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
                      {isAdmin && <option value="archived">Arhiivitud</option>}
                      <option value="cancelled">Tühistatud</option>
                    </select>
                  </FormField>
                  <div style={{ marginTop: "0.75rem" }}>
                    {isAdmin && (
                      <FormField label="Prioriteet">
                        <select
                          className="input"
                          value={selectedTicket.priority}
                          onChange={e => updateTicket(selectedTicket.id, { priority: e.target.value })}
                        >
                          <option value="none">Puudub</option>
                          <option value="low">Madal</option>
                          <option value="medium">Keskmine</option>
                          <option value="high">Kõrge</option>
                        </select>
                      </FormField>
                    )}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    {canAssignSpecialist && (
                      <FormField label="Lisa spetsialist">
                        <div style={{ display: 'flex', gap: 8 }}>
                          <select className="input" value={selectedSpecialist ?? ''} onChange={e => setSelectedSpecialist(Number(e.target.value) || null)}>
                            <option value="">Vali...</option>
                            {availableSpecialists.map(u => (
                              <option key={u.id} value={u.id}>
                                {u.name} {u.phone ? `(${u.phone})` : ''}
                              </option>
                            ))}
                          </select>
                          <button className="btn btn-primary" onClick={handleAssignSpecialist} disabled={!selectedSpecialist}>Määra</button>
                        </div>
                      </FormField>
                    )}
                  </div>
                  {/* Assignment management handled via admin specialist flow */}
                </div>
              )}

              {/* Kasutaja tühistamine */}
              {!canManageAll && selectedTicket.status === "open" && selectedTicket.creator.id === user?.id && (
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

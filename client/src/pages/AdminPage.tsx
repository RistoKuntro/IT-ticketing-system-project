import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { getUsers, updateUserRole, deleteUser, updateUserName } from "../api/userApi"
import { Badge } from "../components/Badge"
import Modal from "../components/Modal"
import { User } from "../types"

export const AdminPage: React.FC = () => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await getUsers()
        setUsers(res.users)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Viga kasutajate laadimisel")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  function openUserModal(user: User) {
    if (user.id === currentUser?.id) return; // Don't edit self here
    setSelectedUser(user);
    setEditName(user.name);
    setModalError(null);
  }

  async function handleRoleChange(newRole: "admin" | "specialist" | "user") {
    if (!selectedUser) return;
    setModalError(null)
    try {
      const res = await updateUserRole(selectedUser.id, newRole)
      setUsers(prev => prev.map(u => (u.id === selectedUser.id ? { ...u, role: res.user.role } : u)))
      setSelectedUser(res.user) // update modal 
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : "Viga rolli muutmisel")
    }
  }

  async function handleNameUpdate() {
    if (!selectedUser) return;
    if (editName.trim() === selectedUser.name) return;
    setModalError(null)
    try {
      const res = await updateUserName(selectedUser.id, editName.trim())
      setUsers(prev => prev.map(u => (u.id === selectedUser.id ? { ...u, name: res.user.name } : u)))
      setSelectedUser(res.user)
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : "Viga nime muutmisel")
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) return;
    if (!window.confirm(`Oled kindel et soovid kasutaja ${selectedUser.name} kustutada?`)) return;
    setModalError(null)
    try {
      await deleteUser(selectedUser.id)
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id))
      setSelectedUser(null)
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : "Viga kustutamisel")
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
      {/* Päis */}
      <div className="page-header">
        <div>
          <h1>Kasutajate haldus</h1>
          <p className="page-subtitle">
            {isLoading ? "Laadin..." : `${users.length} kasutajat registreeritud`}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </div>

      {/* Vead */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Laadimine */}
      {isLoading && <div className="loading">Laadin kasutajaid...</div>}

      {/* Kasutajate tabel */}
      {!isLoading && users.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kasutaja</th>
                <th>E-post</th>
                <th>Roll</th>
                <th>Registreeritud</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr
                  key={u.id}
                  className={u.id === currentUser?.id ? "admin-table-row-self" : ""}
                  onClick={() => openUserModal(u)}
                >
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name">
                        {u.name}
                        {u.id === currentUser?.id && (
                          <span className="self-label"> (sina)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="user-email">{u.email}</td>
                  <td>
                    <Badge label={u.role.name} variant="role" />
                  </td>
                  <td className="user-date">
                    {new Date(u.createdAt).toLocaleDateString("et-EE", {
                      dateStyle: "medium",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tühi olek */}
      {!isLoading && users.length === 0 && !error && (
        <div className="empty-state">
          <p>Kasutajaid ei leitud</p>
        </div>
      )}

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Kasutaja: ${selectedUser?.name}`} maxWidth={500}>
        {selectedUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {modalError && <div className="alert alert-error">{modalError}</div>}
            
            <div className="form-field">
              <label>Muuda nime</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input 
                  type="text" 
                  className="input" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <button className="btn btn-secondary" onClick={handleNameUpdate}>Salvesta</button>
              </div>
            </div>

            <div className="form-field">
              <label>Kasutaja roll (praegu: {selectedUser.role.name})</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                <button className={`btn btn-sm ${selectedUser.role.name === 'admin' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleRoleChange('admin')}>Admin</button>
                <button className={`btn btn-sm ${selectedUser.role.name === 'specialist' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleRoleChange('specialist')}>Spetsialist</button>
                <button className={`btn btn-sm ${selectedUser.role.name === 'user' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleRoleChange('user')}>Kasutaja</button>
              </div>
            </div>

            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)", textAlign: "right" }}>
              <button className="btn btn-danger" onClick={handleDeleteUser}>
                Kustuta profiil
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

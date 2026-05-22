import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { getUsers, updateUserRole } from "../api/userApi"
import { Badge } from "../components/Badge"
import { User } from "../types"

export const AdminPage: React.FC = () => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

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

  async function handleRoleChange(userId: number, newRole: "admin" | "user") {
    setUpdatingId(userId)
    setUpdateError(null)
    try {
      const res = await updateUserRole(userId, newRole)
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: res.user.role } : u))
      )
    } catch (e: unknown) {
      setUpdateError(e instanceof Error ? e.message : "Viga rolli muutmisel")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
      {updateError && <div className="alert alert-error">{updateError}</div>}

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
                <th>Tegevused</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr
                  key={u.id}
                  className={u.id === currentUser?.id ? "admin-table-row-self" : ""}
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
                  <td>
                    {u.id === currentUser?.id ? (
                      <span className="no-action">—</span>
                    ) : u.role.name === "user" ? (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={updatingId === u.id}
                        onClick={() => handleRoleChange(u.id, "admin")}
                      >
                        {updatingId === u.id ? "..." : "Tee adminiks"}
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={updatingId === u.id}
                        onClick={() => handleRoleChange(u.id, "user")}
                      >
                        {updatingId === u.id ? "..." : "Eemalda admin"}
                      </button>
                    )}
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
    </div>
  )
}

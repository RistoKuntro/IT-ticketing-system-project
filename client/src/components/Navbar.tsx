import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { Badge } from "./Badge"

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAdmin, isAuthenticated, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Vasak: logo */}
        <Link to="/dashboard" className="navbar-logo">
          HelpDesk
        </Link>

        {/* Parem: navigatsioon */}
        <div className="navbar-right">
          {isAuthenticated && user ? (
            <>
              {/* Admin link */}
              {isAdmin && (
                <Link to="/admin" className="navbar-link">
                  Admin paneel
                </Link>
              )}
              <Link to="/archive" className="navbar-link">
                Arhiiv
              </Link>

              {/* Kasutaja info */}
              <div className="navbar-user">
                <Link to="/profile" style={{ display: 'flex', gap: 8, alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                  <div className="navbar-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="navbar-username">{user.name}</span>
                </Link>
                <Badge label={typeof user.role === 'string' ? user.role : (user.role as any).name} variant="role" />
              </div>

              {/* Väljalogimine */}
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logi välja
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-action">Logi sisse</Link>
              <Link to="/register" className="navbar-action">Registreeru</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

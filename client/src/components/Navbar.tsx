import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';

export const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand">IT Tugi</Link>
      </div>

      <nav className="nav-right">
        {isAuthenticated ? (
          <div className="nav-links">
            <span className="nav-welcome">Tere, {user?.name}</span>
            <button onClick={handleLogout} className="btn-logout">Logi välja</button>
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/login" className="nav-link">Logi sisse</Link>
            <Link to="/register" className="nav-link">Loo konto</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

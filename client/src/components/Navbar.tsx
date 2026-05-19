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
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <Link to="/" className="font-bold text-xl">IT Tugi</Link>
      <div>
        {isAuthenticated ? (
          <>
            <span className="mr-4">Tere, {user?.name}</span>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logi välja</button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Logi sisse</Link>
            <Link to="/register">Loo konto</Link>
          </>
        )}
      </div>
    </nav>
  );
};

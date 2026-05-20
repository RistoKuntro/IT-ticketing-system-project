// useSessionRestore taastab autentitud sessiooni rakenduse laadimisel, kontrollides tokenit serveris.
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch } from '../store/store';
import { setCredentials, logout } from '../store/authSlice';
import { getMe } from '../api/authApi';
import { AuthUser } from '../types';

export const useSessionRestore = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isRestoring, setIsRestoring] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsRestoring(false);
        return;
      }

      try {
        const user = await getMe();
        if (!cancelled) {
          dispatch(setCredentials({ user: user as AuthUser, token }));
        }
      } catch (error) {
        if (!cancelled) {
          dispatch(logout());
          if (location.pathname !== '/login') {
            navigate('/login', { replace: true });
          }
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [dispatch, location.pathname, navigate]);

  return { isRestoring };
};

// useAuth hook kapseldab kogu autentimise loogika ja hoiab vead ning laadimise lokaalses olekus.
import { useCallback, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setCredentials, logout, setError, clearError } from '../store/authSlice';
import * as authApi from '../api/authApi';

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Serveri viga'
    );
  }

  return 'Tundmatu viga';
}

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, error } = useSelector(
    (state: RootState) => state.auth
  );
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      dispatch(clearError());

      try {
        const data = await authApi.login({ email, password });
        dispatch(setCredentials({ user: data.user, token: data.token }));
      } catch (err) {
        const message = extractErrorMessage(err);
        dispatch(setError(message));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      setIsLoading(true);
      dispatch(clearError());

      try {
        const data = await authApi.register({ name, email, password });
        dispatch(setCredentials({ user: data.user, token: data.token }));
      } catch (err) {
        const message = extractErrorMessage(err);
        dispatch(setError(message));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    error,
    isLoading,
    login,
    register,
    logout: logoutUser,
    clearError: clearAuthError,
  };
};

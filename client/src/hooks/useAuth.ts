import { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '@/services/api';
import type { AuthState } from '@/types';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState);
  const loadUserCalled = useRef(false);

  useEffect(() => {
    if (loadUserCalled.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      loadUserCalled.current = true;
      authApi.me(token)
        .then(({ user }) => {
          setState({
            user,
            accessToken: token,
            isLoading: false,
            isAuthenticated: true,
          });
          window.history.replaceState({}, '', '/account');
        })
        .catch(() => {
          setState({
            user: null,
            accessToken: null,
            isLoading: false,
            isAuthenticated: false,
          });
        });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    const { user, accessToken } = await authApi.login({ email, password });
    setState({ user, accessToken, isLoading: false, isAuthenticated: true });
    return { user, accessToken };
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    const { user, accessToken } = await authApi.register({ email, password, name });
    setState({ user, accessToken, isLoading: false, isAuthenticated: true });
    return { user, accessToken };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorar errores de logout
    }
    setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
  }, []);

  const googleLogin = useCallback(() => {
    authApi.googleLogin();
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    googleLogin,
  };
}
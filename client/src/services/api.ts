import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ApiError,
  User,
} from '@/types';

const API_URL = '/auth';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: 'Error de conexion',
    }));
    throw new Error(error.error || 'Error desconocido');
  }
  return response.json();
}

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(response);
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(response);
  },

  logout: async (): Promise<void> => {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'Error de conexion',
      }));
      throw new Error(error.error);
    }
  },

  me: async (accessToken: string): Promise<{ user: User }> => {
    const response = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    });
    return handleResponse<{ user: User }>(response);
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const response = await fetch(`${API_URL}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<{ accessToken: string }>(response);
  },

  googleLogin: () => {
    window.location.href = `${API_URL}/google`;
  },
};
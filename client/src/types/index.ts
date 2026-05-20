export enum AuthMethod {
  GOOGLE = 'GOOGLE',
  EMAIL = 'EMAIL',
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  authMethod: AuthMethod;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  timestamp?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
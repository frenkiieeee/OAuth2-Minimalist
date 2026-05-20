import type { User } from '../types/index.js';

export function createAuthResponse(user: Omit<User, 'passwordHash'>, accessToken: string) {
  return {
    user,
    accessToken,
  };
}

export function createErrorResponse(message: string, code?: string) {
  return {
    error: message,
    code: code || 'AUTH_ERROR',
    timestamp: new Date().toISOString(),
  };
}

export function createSuccessResponse(data: unknown, message?: string) {
  return {
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}
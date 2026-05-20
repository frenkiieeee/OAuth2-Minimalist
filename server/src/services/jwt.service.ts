import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_EXPIRY_DAYS = 7;

export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(): string {
  return crypto.randomUUID() + '-' + crypto.randomUUID();
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function getRefreshTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + JWT_REFRESH_EXPIRY_DAYS);
  return expiry;
}

export function isRefreshTokenExpired(expiresAt: Date): boolean {
  return expiresAt < new Date();
}
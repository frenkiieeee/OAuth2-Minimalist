import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  hashPassword,
  verifyPassword,
  sanitizeUser,
  validateEmail,
  validatePassword,
  createAuthResponse,
  createErrorResponse,
} from '../services/index.js';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  isRefreshTokenExpired,
} from '../services/jwt.service.js';
import { AuthMethod } from '../types/index.js';
import type { DatabaseAdapter } from '../types/index.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  constructor(private db: DatabaseAdapter) {}

  register = async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json(createErrorResponse('Datos invalidos'));
      }

      const { email, password, name } = parsed.data;

      if (!validateEmail(email)) {
        return res.status(400).json(createErrorResponse('Email invalido'));
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json(createErrorResponse(passwordValidation.message || 'Contrasena invalida'));
      }

      const existingUser = await this.db.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json(createErrorResponse('El email ya esta registrado'));
      }

      const passwordHash = await hashPassword(password);

      const user = await this.db.createUser({
        email,
        passwordHash,
        name,
        authMethod: AuthMethod.EMAIL,
      });

      const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        authMethod: user.authMethod,
      });

      const refreshToken = generateRefreshToken();
      const expiresAt = getRefreshTokenExpiry();
      await this.db.createRefreshToken(refreshToken, user.id, expiresAt);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
      });

      return res.status(201).json(createAuthResponse(sanitizeUser(user), accessToken));
    } catch (error) {
      console.error('Error en registro:', error);
      return res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json(createErrorResponse('Datos invalidos'));
      }

      const { email, password } = parsed.data;

      const user = await this.db.findUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json(createErrorResponse('Credenciales invalidas'));
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json(createErrorResponse('Credenciales invalidas'));
      }

      const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        authMethod: user.authMethod,
      });

      const refreshToken = generateRefreshToken();
      const expiresAt = getRefreshTokenExpiry();
      await this.db.deleteUserRefreshTokens(user.id);
      await this.db.createRefreshToken(refreshToken, user.id, expiresAt);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
      });

      return res.status(200).json(createAuthResponse(sanitizeUser(user), accessToken));
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await this.db.deleteRefreshToken(refreshToken);
      }

      res.clearCookie('refreshToken');
      return res.status(200).json({ message: 'Sesion cerrada correctamente' });
    } catch (error) {
      console.error('Error en logout:', error);
      return res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json(createErrorResponse('No autenticado'));
      }

      const user = await this.db.findUserById(req.user.sub);
      if (!user) {
        return res.status(404).json(createErrorResponse('Usuario no encontrado'));
      }

      return res.status(200).json({ user: sanitizeUser(user) });
    } catch (error) {
      console.error('Error en me:', error);
      return res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  };

  refresh = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json(createErrorResponse('Refresh token no proporcionado'));
      }

      const storedToken = await this.db.findRefreshToken(refreshToken);

      if (!storedToken) {
        return res.status(401).json(createErrorResponse('Refresh token invalido'));
      }

      if (isRefreshTokenExpired(storedToken.expiresAt)) {
        await this.db.deleteRefreshToken(refreshToken);
        return res.status(401).json(createErrorResponse('Refresh token expirado'));
      }

      const user = await this.db.findUserById(storedToken.userId);
      if (!user) {
        return res.status(401).json(createErrorResponse('Usuario no encontrado'));
      }

      await this.db.deleteRefreshToken(refreshToken);

      const newAccessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        authMethod: user.authMethod,
      });

      const newRefreshToken = generateRefreshToken();
      const expiresAt = getRefreshTokenExpiry();
      await this.db.createRefreshToken(newRefreshToken, user.id, expiresAt);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
      });

      return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      console.error('Error en refresh:', error);
      return res.status(500).json(createErrorResponse('Error interno del servidor'));
    }
  };
}
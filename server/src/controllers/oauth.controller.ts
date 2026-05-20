import type { Request, Response } from 'express';
import {
  generateOAuthState,
  buildGoogleAuthUrl,
  exchangeCodeForTokens,
  getGoogleUserInfo,
  isOAuthStateValid,
} from '../services/oauth.service.js';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from '../services/jwt.service.js';
import { createErrorResponse } from '../services/index.js';
import type { DatabaseAdapter, OAuthState } from '../types/index.js';
import { AuthMethod } from '../types/index.js';

const oauthStates: Map<string, OAuthState> = new Map();

export class OAuthController {
  constructor(private db: DatabaseAdapter) {}

  initGoogle = async (_req: Request, res: Response) => {
    try {
      const stateData = generateOAuthState();
      oauthStates.set(stateData.state, stateData);

      const authUrl = await buildGoogleAuthUrl(stateData.state, stateData.codeVerifier);
      return res.redirect(authUrl);
    } catch (error) {
      console.error('Error al iniciar flujo Google OAuth:', error);
      return res.status(500).json(createErrorResponse('Error al iniciar sesion con Google'));
    }
  };

  callbackGoogle = async (req: Request, res: Response) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        console.error('Google OAuth error:', error, req.query.error_description);
        return res.status(400).json(createErrorResponse(`Google OAuth error: ${error}`));
      }

      if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
        return res.status(400).json(createErrorResponse('Parametros invalidos'));
      }

      const stateData = oauthStates.get(state);
      if (!stateData) {
        return res.status(400).json(createErrorResponse('Estado OAuth invalido'));
      }

      if (!isOAuthStateValid(stateData)) {
        oauthStates.delete(state);
        return res.status(400).json(createErrorResponse('Estado OAuth expirado'));
      }

      oauthStates.delete(state);

      const tokens = await exchangeCodeForTokens(code, stateData.codeVerifier);
      const googleUser = await getGoogleUserInfo(tokens.access_token);

      let user = await this.db.findUserByEmail(googleUser.email);

      if (!user) {
        user = await this.db.createUser({
          email: googleUser.email,
          name: googleUser.name || undefined,
          avatar: googleUser.picture || undefined,
          authMethod: AuthMethod.GOOGLE,
        });
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

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      return res.redirect(`${clientUrl}/account?token=${accessToken}`);
    } catch (error) {
      console.error('Error en callback Google OAuth:', error);
      return res.status(500).json(createErrorResponse('Error en autenticacion con Google'));
    }
  };
}
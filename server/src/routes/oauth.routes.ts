import { Router } from 'express';
import { OAuthController } from '../controllers/index.js';
import { oauthLimiter } from '../middleware/index.js';
import type { DatabaseAdapter } from '../types/index.js';
import type { Router as ExpressRouter } from 'express';

export function createOAuthRoutes(db: DatabaseAdapter): ExpressRouter {
  const controller = new OAuthController(db);
  const router = Router();

  router.get('/google', oauthLimiter, controller.initGoogle);
  router.get('/google/callback', oauthLimiter, controller.callbackGoogle);

  return router;
}
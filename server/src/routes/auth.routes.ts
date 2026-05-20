import { Router } from 'express';
import { AuthController } from '../controllers/index.js';
import { authLimiter } from '../middleware/index.js';
import type { DatabaseAdapter } from '../types/index.js';
import type { Router as ExpressRouter } from 'express';

export function createAuthRoutes(db: DatabaseAdapter): ExpressRouter {
  const controller = new AuthController(db);
  const router = Router();

  router.post('/register', authLimiter, controller.register);
  router.post('/login', authLimiter, controller.login);
  router.post('/logout', controller.logout);
  router.post('/refresh', controller.refresh);

  return router;
}
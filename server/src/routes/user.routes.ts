import { Router } from 'express';
import { AuthController } from '../controllers/index.js';
import { authMiddleware } from '../middleware/index.js';
import type { DatabaseAdapter } from '../types/index.js';
import type { Router as ExpressRouter } from 'express';

export function createUserRoutes(db: DatabaseAdapter): ExpressRouter {
  const controller = new AuthController(db);
  const router = Router();

  router.get('/me', authMiddleware, controller.me);

  return router;
}
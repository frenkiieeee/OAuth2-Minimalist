import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiadas solicitudes, intenta mas tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const oauthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiadas solicitudes OAuth, intenta mas tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

import { createAdapter } from './adapters/index.js';
import { createAuthRoutes, createOAuthRoutes, createUserRoutes } from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const DB_ADAPTER = (process.env.DB_ADAPTER || 'memory') as 'memory' | 'postgres';

let prisma: PrismaClient | undefined;

if (DB_ADAPTER === 'postgres') {
  prisma = new PrismaClient();
}

const db = createAdapter(DB_ADAPTER, prisma);

app.use(helmet());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/auth', createAuthRoutes(db));
app.use('/auth', createOAuthRoutes(db));
app.use('/auth', createUserRoutes(db));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT} [${NODE_ENV}]`);
  console.log(`Adapter de base de datos: ${DB_ADAPTER}`);
});

process.on('SIGTERM', async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
});
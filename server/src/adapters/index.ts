import { PrismaClient } from '@prisma/client';
import { DatabaseAdapter } from '../types/index.js';
import { MemoryAdapter } from './MemoryAdapter.js';
import { PostgresAdapter } from './PostgresAdapter.js';

export type AdapterType = 'memory' | 'postgres';

export function createAdapter(type: AdapterType, prisma?: PrismaClient): DatabaseAdapter {
  switch (type) {
    case 'memory':
      return new MemoryAdapter();
    case 'postgres':
      if (!prisma) {
        throw new Error('PrismaClient es requerido para el adapter PostgreSQL');
      }
      return new PostgresAdapter(prisma) as unknown as DatabaseAdapter;
    default:
      throw new Error(`Tipo de adapter desconocido: ${type}`);
  }
}

export { MemoryAdapter, PostgresAdapter };
export type { DatabaseAdapter } from '../types/index.js';
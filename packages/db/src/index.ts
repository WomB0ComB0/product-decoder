export * from './database.gen';
export * from './seed';

// Re-export Prisma client and types for workspace consumption
export { PrismaClient } from '@prisma/client';
export type { Prisma } from '@prisma/client';
export { withAccelerate } from '@prisma/extension-accelerate';


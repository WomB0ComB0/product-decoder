import { serverOnly } from "@tanstack/react-start";
import { logger } from "@product-decoder/shared";
import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const log = logger.getSubLogger({ prefix: ['Prisma'] });

const options: Record<string, Prisma.PrismaClientOptions> = {
  development: {
    errorFormat: 'pretty' as const,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ] as const,
    transactionOptions: {
      maxWait: 10000,
      timeout: 10000,
    },
  },
  production: {
    errorFormat: 'minimal' as const,
    log: [{ emit: 'event', level: 'error' }] as const,
    transactionOptions: {
      maxWait: 10000,
      timeout: 10000,
    },
  },
  test: {
    errorFormat: 'pretty' as const,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ] as const,
    transactionOptions: {
      maxWait: 10000,
      timeout: 10000,
    },
  },
};

/**
 * Creates a new PrismaClient instance with appropriate options
 */
const createPrismaClient = () => {
  const nodeEnv = (process.env.NODE_ENV || 'development') as keyof typeof options;
  log.info(`Creating PrismaClient with ${nodeEnv} configuration`);

  return new PrismaClient(options[nodeEnv]).$extends(withAccelerate());
};

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  log.info('Setting Prisma client in global scope for development');
  globalForPrisma.prisma = prisma;
}


const getDatabase = serverOnly(() => prisma);

export const db = getDatabase();
export { prisma as prismaClient };

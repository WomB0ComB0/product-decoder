'use server';

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { logger } from '../packages/utils';

const execPromise = promisify(exec);

const retry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      logger.warn(`Retrying... (${retries} attempts left)`, { error });
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay);
    }
    throw error;
  }
};

(async () => {
  const isDev = process.env.NODE_ENV !== 'production';

  try {
    logger.info('Starting database setup...', { env: process.env.NODE_ENV });

    logger.info('Generating Prisma client...');
    const { stdout: generateOutput, stderr: generateError } = await retry(() =>
      execPromise('bun run prisma generate --schema=./prisma/schema.prisma'),
    );

    if (generateError) {
      logger.warn('Prisma generate produced warnings:', { error: generateError });
    }
    logger.info('Prisma client generated:', { output: generateOutput });

    if (isDev) {
      logger.info('Pushing schema changes (development only)...');
      try {
        const { stdout: pushOutput, stderr: pushError } = await retry(() =>
          execPromise('bun run prisma:push'),
        );
        if (pushError) {
          logger.warn('Schema push produced warnings:', { error: pushError });
        }
        logger.info('Schema push completed:', { output: pushOutput });
      } catch (pushError) {
        logger.warn('Schema push failed, continuing with migrations:', { error: pushError });
      }
    }

    logger.info('Applying migrations...');
    const { stdout: migrateOutput, stderr: migrateError } = await retry(() =>
      execPromise('bun run prisma:migrate'),
    );

    if (migrateError) {
      logger.warn('Migration produced warnings:', { error: migrateError });
    }
    logger.info('Migrations completed:', { output: migrateOutput });

    logger.info('Seeding database...');
    const { stdout: seedOutput, stderr: seedError } = await retry(() =>
      execPromise('bun run prisma:seed'),
    );

    if (seedError) {
      logger.warn('Database seeding produced warnings:', { error: seedError });
    }
    logger.info('Database seeding completed:', { output: seedOutput });

    logger.info('Database setup completed successfully!');
  } catch (error) {
    logger.error('Failed to complete database setup:', { error });

    (Error.isError(error)) &&
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        // @ts-ignore
        code: error.code,
      });
    process.exit(1);
  }
})();

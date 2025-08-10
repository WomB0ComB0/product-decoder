import { logger } from '@packages/logger';

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

    // Validate DATABASE_URL first
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Check if DATABASE_URL includes database name for MongoDB
    if (databaseUrl.includes('mongodb') && !databaseUrl.includes('mongodb.net/')) {
      logger.warn('MongoDB connection string should include database name');
      logger.info(
        'Example: mongodb+srv://user:pass@cluster.mongodb.net/your-database-name?retryWrites=true&w=majority',
      );
    }

    logger.info('Generating Prisma client...');
    const { stdout: generateOutput, stderr: generateError } = await retry(() =>
      Bun.spawn(['bunx', 'prisma', 'generate', '--schema=./prisma/schema.prisma'], {
        stdout: 'pipe',
        stderr: 'pipe',
      }).exited.then(async (exitCode) => {
        if (exitCode !== 0) {
          throw new Error(`Prisma generate failed with exit code ${exitCode}`);
        }
        return { stdout: '', stderr: '' };
      }),
    );

    if (generateError) {
      logger.warn('Prisma generate produced warnings:', { error: generateError });
    }
    logger.info('Prisma client generated:', { output: generateOutput });

    // For MongoDB, we use db push instead of migrations
    if (isDev) {
      logger.info('Pushing schema changes to MongoDB (development only)...');
      try {
        const { stdout: pushOutput, stderr: pushError } = await retry(() =>
          Bun.spawn(['bunx', 'prisma', 'db', 'push', '--schema=./prisma/schema.prisma'], {
            stdout: 'pipe',
            stderr: 'pipe',
          }).exited.then(async (exitCode) => {
            if (exitCode !== 0) {
              throw new Error(`Schema push failed with exit code ${exitCode}`);
            }
            return { stdout: '', stderr: '' };
          }),
        );
        if (pushError) {
          logger.warn('Schema push produced warnings:', { error: pushError });
        }
        logger.info('Schema push completed:', { output: pushOutput });
      } catch (pushError) {
        logger.error('Schema push failed:', { error: pushError });
        throw pushError;
      }
    } else {
      logger.info('Production environment - skipping schema push');
      logger.info(
        'Note: For MongoDB production deployments, ensure your database schema is properly set up',
      );
    }

    // Skip migration deploy for MongoDB as it's not supported
    logger.info('Skipping migration deploy (not supported for MongoDB)');

    // Optional: Run database seeding if seed script exists
    try {
      logger.info('Attempting to seed database...');
      const { stdout: seedOutput, stderr: seedError } = await retry(() =>
        Bun.spawn(['bunx', 'prisma', 'db', 'seed', '--schema=./prisma/schema.prisma'], {
          stdout: 'pipe',
          stderr: 'pipe',
        }).exited.then(async (exitCode) => {
          if (exitCode !== 0) {
            throw new Error(`Database seeding failed with exit code ${exitCode}`);
          }
          return { stdout: '', stderr: '' };
        }),
      );

      if (seedError) {
        logger.warn('Database seeding produced warnings:', { error: seedError });
      }
      logger.info('Database seeding completed:', { output: seedOutput });
    } catch (seedError) {
      logger.warn('Database seeding failed or no seed script found:', { error: seedError });
      // Don't fail the entire setup if seeding fails
    }

    logger.info('Database setup completed successfully!');
  } catch (error) {
    logger.error('Failed to complete database setup:', { error });

    if (Error.isError(error)) {
      logger.error('Error details:', {
        error: {
          message: error.message,
          stack: error.stack,
          // @ts-ignore
          code: error.code,
        },
      });
    }
    process.exit(1);
  }
})();

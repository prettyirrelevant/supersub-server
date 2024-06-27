import { Worker, Queue } from 'bullmq';
import path from 'path';

import { logger } from '~/pkg/logging';
import { redis } from '~/pkg/redis';
import { config } from '~/pkg/env';

const queue = new Queue('supersub-queue', { connection: redis });

const addJobsToQueue = async () => {
  // Runs every minute
  await queue.add('enrich-tokens', {}, { repeat: { pattern: '* * * * *' } });

  // Runs every 12 hours (0th minute of every 12th hour)
  await queue.add('renew-subscriptions', {}, { repeat: { pattern: '0 */12 * * *' } });

  // Runs every five(5) minutes
  await queue.add('fetch-smart-accounts', {}, { repeat: { every: 300_000 } });

  // Runs every 30 seconds
  await queue.add('index-subscription-plugin-events', {}, { repeat: { every: 30_000 } });

  // Runs every 24 hours (daily at midnight)
  await queue.add('upcoming-subscriptions-renewal-reminders', {}, { repeat: { pattern: '0 0 * * *' } });
};

addJobsToQueue();

const sandboxedWorkerPath = () => {
  return config.ENVIRONMENT === 'development'
    ? path.join(path.dirname(path.dirname(path.dirname(__filename))), 'workers', `sandboxed.ts`)
    : path.join(path.dirname(__filename), 'workers', 'sandboxed.js');
};

const worker = new Worker('supersub-queue', sandboxedWorkerPath(), {
  connection: redis,
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing queues');

  await worker.close();
  logger.info('All closed');
});

export { queue };

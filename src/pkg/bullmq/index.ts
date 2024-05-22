import { Worker, Queue } from 'bullmq';
import path from 'node:path';

import { logger } from '~/pkg/logging';
import { redis } from '~/pkg/redis';

const queue = new Queue('supersub-queue', { connection: redis });
const worker = new Worker('supersub-queue', `${path.dirname(path.dirname(__dirname))}/workers/sandboxed.ts`, {
  connection: redis,
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing queues');

  await worker.close();
  logger.info('All closed');
});

export { queue };

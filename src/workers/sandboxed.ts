import { polygonAmoy } from '@alchemy/aa-core';
import { Job } from 'bullmq';

import { fetchSmartAccounts } from './handlers/fetchSmartAccounts';

export default async function (job: Job) {
  await job.log('Start processing job');

  if (job.name === 'fetch-smart-accounts') {
    await fetchSmartAccounts(polygonAmoy);
  }

  console.log('Doing something useful...', job.id, job.data);
}

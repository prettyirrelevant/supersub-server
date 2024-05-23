import { polygonAmoy } from '@alchemy/aa-core';
import { Job } from 'bullmq';

import { indexSubscriptionPluginEvents } from './handlers/indexSubscriptionPluginEvents';
import { fetchSmartAccounts } from './handlers/fetchSmartAccounts';
import { enrichERC20Tokens } from './handlers/enrichTokens';

export default async function (job: Job) {
  await job.log('Start processing job');

  if (job.name === 'fetch-smart-accounts') {
    await fetchSmartAccounts(polygonAmoy);
  } else if (job.name === 'enrich-tokens') {
    await enrichERC20Tokens(polygonAmoy);
  } else if (job.name === 'index-subscription-plugin-events') {
    await indexSubscriptionPluginEvents(polygonAmoy);
  }
  console.log('Doing something useful...', job.id, job.data);
}

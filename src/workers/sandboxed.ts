import { polygonAmoy } from 'viem/chains';
import { Job } from 'bullmq';

import { logger } from '~/pkg/logging';

import { indexSubscriptionPluginEvents } from './handlers/indexSubscriptionPluginEvents';
import { notifyUsersForUpcomingSubscriptionRenewal } from './handlers/emailNotification';
import { fetchSmartAccounts } from './handlers/fetchSmartAccounts';
import { renewSubscriptions } from './handlers/renewSubscriptions';
import { enrichERC20Tokens } from './handlers/enrichTokens';

export default async function (job: Job) {
  logger.info(`Starting job...`, { jobName: job.name, jobData: job.data });

  if (job.name === 'fetch-smart-accounts') {
    await fetchSmartAccounts(polygonAmoy);
  } else if (job.name === 'enrich-tokens') {
    await enrichERC20Tokens(polygonAmoy);
  } else if (job.name === 'index-subscription-plugin-events') {
    await indexSubscriptionPluginEvents(polygonAmoy);
  } else if (job.name === 'upcoming-subscriptions-renewal-reminders') {
    await notifyUsersForUpcomingSubscriptionRenewal();
  } else if (job.name === 'renew-subscriptions') {
    await renewSubscriptions(polygonAmoy);
  } else {
    logger.warn(`Unrecognized job name. Skipping...`, { jobName: job.name });
  }
}

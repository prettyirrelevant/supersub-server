import 'dotenv/config';

import { config } from '~/pkg/env';

import { application, logger } from './app';

const server = application.listen(config.PORT, () => {
  logger.debug(`server is running on port ${config.PORT}`);
});

const exitHandler = (): void => {
  server.close(() => {
    logger.info('server closed');
    process.exit(1);
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unexpectedErrorHandler = (error: Error | any): void => {
  logger.error('unexpected error encountered', { err: error });
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', () => {
  logger.info('sigterm received. closing server...');
  server.close();
});

export { application };

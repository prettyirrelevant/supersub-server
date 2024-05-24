import { Account } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      auth: {
        apiKey: 'public' | 'secret' | null;
        method: 'access-token' | 'api-key';
        account: Account;
      };
    }
  }
}

import { Account } from '@prisma/client';

declare module 'express' {
  interface Request {
    auth: {
      apiKey: 'public' | 'secret' | null;
      method: 'access-token' | 'api-key';
      account: Account;
    };
  }
}

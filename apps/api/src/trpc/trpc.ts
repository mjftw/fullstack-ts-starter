import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import type { Services } from 'src/services/services.module';

export const createContext = (
  { req, res }: trpcExpress.CreateExpressContextOptions,
  services: Services,
) => {
  return {
    req,
    res,
    services,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();

import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import type { Services } from 'src/services/services.module';

export const createContext = ({
  services,
  opts: {},
}: {
  services: Services;
  opts: trpcExpress.CreateExpressContextOptions;
}) => {
  return {
    // Can get session context from UserService and add here
    services,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

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

export const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  findAllUsers: t.procedure.query(
    async ({
      ctx: {
        services: { userService },
      },
    }) => {
      return await userService.findAllUsers();
    },
  ),
});
// export type definition of API
export type AppRouter = typeof appRouter;

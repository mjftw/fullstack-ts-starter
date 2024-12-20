import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.name ?? 'World'}!`,
      };
    }),
});

export type AppRouter = typeof appRouter;

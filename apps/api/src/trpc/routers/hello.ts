import { z } from 'zod';
import { t } from '../trpc';

export const helloRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.name ?? 'World'}!`,
      };
    }),
});

export type HelloRouter = typeof helloRouter;

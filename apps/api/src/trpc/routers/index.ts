import { createTRPCRouter } from '../trpc';
import { AnyRouter } from '@trpc/server';
import { helloRouter } from './hello';
import { usersRouter } from './users';

export const appRouter = createTRPCRouter({
  hello: helloRouter,
  users: usersRouter,
}) satisfies AnyRouter;

export type AppRouter = typeof appRouter;

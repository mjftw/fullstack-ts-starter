// import { z } from 'zod';
// import { createTRPCRouter, publicProcedure } from '../trpc';
// import { AnyRouter } from '@trpc/server';

// export const appRouter = createTRPCRouter({
//   hello: publicProcedure
//     .input(z.object({ name: z.string().optional() }))
//     .query(({ input }) => {
//       return {
//         greeting: `Hello ${input?.name ?? 'World'}!`,
//       };
//     }),
// }) satisfies AnyRouter;

// export type AppRouter = typeof appRouter;

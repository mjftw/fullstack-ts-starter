import { createTRPCRouter, publicProcedure } from '../trpc';

export const usersRouter = createTRPCRouter({
  findAllUsers: publicProcedure.query(
    async ({
      ctx: {
        services: { userService },
      },
    }) => {
      return await userService.findAllUsers();
    },
  ),
});

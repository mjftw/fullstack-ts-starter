import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().nullable(),
});

const userSchema = createUserSchema.extend({
  id: z.string().uuid(),
});

export const usersRouter = createTRPCRouter({
  create: publicProcedure
    .input(createUserSchema)
    .output(userSchema)
    .mutation(
      async ({
        input,
        ctx: {
          services: { userService },
        },
      }) => {
        return await userService.createUser(input);
      },
    ),

  findAll: publicProcedure.output(z.array(userSchema)).query(
    async ({
      ctx: {
        services: { userService },
      },
    }) => {
      return await userService.findAllUsers();
    },
  ),
});

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './routers/root';
import { createContext } from './trpc';
import { UserService } from 'src/services/userService';

@Injectable()
export class TrpcMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  use(req: Request, res: Response, next: NextFunction) {
    trpcExpress.createExpressMiddleware({
      router: appRouter as any, //FIXME: Fix the types
      createContext: (opts) =>
        createContext(opts, { userService: this.userService }),
    })(req, res, next);
  }
}

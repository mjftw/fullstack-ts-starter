import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '../trpc/routers';
import { createContext } from '../trpc/trpc';
import { UserService } from 'src/services/userService';

@Injectable()
export class TrpcMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Strip /trpc prefix from the URL path
    if (req.url.startsWith('/trpc')) {
      req.url = req.url.replace('/trpc', '');
    }

    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: (opts) =>
        createContext({
          opts,
          services: {
            userService: this.userService,
          },
        }),
    })(req, res, next);
  }
}

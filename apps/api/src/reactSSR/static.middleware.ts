import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';

@Injectable()
export class StaticMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService<{
      REACT_SSR_CLIENT_STATIC_DIR: string;
    }>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const staticPath = this.configService.getOrThrow<string>(
      'REACT_SSR_CLIENT_STATIC_DIR',
    );
    express.static(staticPath)(req, res, next);
  }
}

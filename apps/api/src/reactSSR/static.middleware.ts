import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';

@Injectable()
export class StaticMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService<{
      STATIC_FILES_PATH: string;
    }>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const staticPath =
      this.configService.getOrThrow<string>('STATIC_FILES_PATH');
    express.static(staticPath)(req, res, next);
  }
}

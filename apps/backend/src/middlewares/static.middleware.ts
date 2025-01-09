import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';

@Injectable()
export class StaticMiddleware implements NestMiddleware {
  constructor(
    @Inject('STATIC_FILES_DIR') private readonly staticFilesDir: string
  ) {}

  use(req: Request, res: Response, next: NextFunction) {

    express.static(this.staticFilesDir)(req, res, next);
  }
}

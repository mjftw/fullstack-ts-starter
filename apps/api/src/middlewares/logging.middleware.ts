import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const colours = {
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
};

// Pretty print with colour
const withColour = (text: string | number, color: string) => {
  return `${color}${text}${colours.reset}`;
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;

      const methodColor = colours.cyan;
      const urlColor = colours.yellow;
      const statusColor = statusCode >= 400 ? colours.red : colours.green;
      const durationColor = colours.magenta;

      console.log(
        `${withColour(method, methodColor)} ` +
          `${withColour(originalUrl, urlColor)} ` +
          `${withColour(statusCode, statusColor)} - ` +
          `${withColour(duration + 'ms', durationColor)}`,
      );
    });

    next();
  }
}

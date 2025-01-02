import { OnModuleInit } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import { Stream, Transform } from 'node:stream';
import { Logger } from '@nestjs/common/services/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * The function signature for your SSR render method,
 * typically exported from your React SSR entry point
 * (e.g., entry-server.js).
 */
export type RenderFn = (
  url: string,
  opts: {
    onShellError: () => void;
    onShellReady: () => void;
    onError: (err: unknown) => void;
  },
) => {
  pipe: (stream: Stream) => void;
  abort: () => void;
};

/**
 * Production SSR Service:
 * 1) Reads the pre-built index.html from `web-ssr/dist/client/`.
 * 2) Imports the SSR render function from `web-ssr/dist/server/entry-server.js`.
 */
@Injectable()
export class ReactSSRService implements OnModuleInit {
  private readonly clientIndexPath: string;
  private readonly serverEntryPath: string;

  constructor(
    configService: ConfigService<{
      REACT_SSR_CLIENT_INDEX_HTML_PATH: string;
      REACT_SSR_SERVER_ENTRY_JS_PATH: string;
    }>,
  ) {
    this.clientIndexPath = configService.getOrThrow(
      'REACT_SSR_CLIENT_INDEX_HTML_PATH',
    );
    this.serverEntryPath = configService.getOrThrow(
      'REACT_SSR_SERVER_ENTRY_JS_PATH',
    );
  }

  private readonly logger = new Logger(ReactSSRService.name);
  private readonly ABORT_DELAY = 10000;

  private templateHtml = '';
  private renderFn: RenderFn | null = null;

  /**
   * On startup, load the production index.html from `web-ssr/dist/client`.
   */
  public async onModuleInit(): Promise<void> {
    this.logger.log(
      `Loading production index.html from ${this.clientIndexPath}`,
    );

    try {
      this.templateHtml = fs.readFileSync(this.clientIndexPath, 'utf-8');
    } catch (err) {
      this.logger.error(`Failed to load production index.html: ${err}`);
    }

    this.logger.log(`Loading SSR entry from ${this.serverEntryPath}`);

    try {
      const serverModule = await import(this.serverEntryPath);
      this.renderFn = serverModule.render as RenderFn;
    } catch (err) {
      this.logger.error(
        `Failed to load SSR server entry script "${this.serverEntryPath}": ${err}`,
      );
    }
  }

  public async renderPage(url: string, res: Response): Promise<void> {
    console.log(`Render page: ${url}`);

    if (!this.renderFn) {
      throw new Error('Render function not loaded');
    }
    try {
      let didError = false;
      const { pipe, abort } = this.renderFn(url, {
        onShellError: () => {
          res.status(500);
          res.set({ 'Content-Type': 'text/html' });
          res.send('<h1>Something went wrong in production SSR!</h1>');
        },
        onShellReady: () => {
          res.status(didError ? 500 : 200);
          res.set({ 'Content-Type': 'text/html' });

          const transformStream = new Transform({
            transform(chunk, encoding, callback) {
              res.write(chunk, encoding);
              callback();
            },
          });

          const [htmlStart, htmlEnd] =
            this.templateHtml.split('<!--app-html-->');
          res.write(htmlStart);

          transformStream.on('finish', () => {
            res.end(htmlEnd);
          });

          pipe(transformStream);
        },
        onError: (error) => {
          didError = true;
          this.logger.error(error);
        },
      });

      setTimeout(() => abort(), this.ABORT_DELAY);
    } catch (e) {
      this.logger.error(e);
      if (e instanceof Error) {
        // We typically don't have a dev server to fix the stacktrace here,
        // so we just log the error.
        res.status(500).end(e.stack);
      } else {
        res.status(500).end(String(e));
      }
    }
  }
}

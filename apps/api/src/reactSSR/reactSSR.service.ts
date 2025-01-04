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

export type ReactClientPublicData = Record<string, unknown>;

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
    private readonly reactClientPublicData: Record<string, unknown>,
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

  private htmlParts: {
    beforeAppHTML: string;
    afterAppHTML: string;
  } | null = null;
  private renderFn: RenderFn | null = null;

  /**
   * On startup, load the production index.html from `web-ssr/dist/client`.
   */
  public async onModuleInit(): Promise<void> {
    this.logger.log(
      `Loading production index.html from ${this.clientIndexPath}`,
    );

    this.renderFn = await this.loadRenderFn(this.serverEntryPath);
    const indexFileContents = await this.loadIndexFile(this.clientIndexPath);
    this.htmlParts = this.parseHtmlParts(indexFileContents);
  }

  private async loadRenderFn(importPath: string): Promise<RenderFn> {
    this.logger.log(`Loading SSR entry from ${importPath}`);

    const serverModule = await import(importPath).catch((err) => {
      this.logger.error(
        `Failed to load SSR server entry script "${importPath}": ${err}`,
      );
      throw err;
    });

    if (!serverModule.render) {
      throw new Error(
        `SSR server entry script "${importPath}" does not export a render function`,
      );
    }

    return serverModule.render as RenderFn;
  }

  private async loadIndexFile(path: string): Promise<string> {
    try {
      return fs.readFileSync(path, 'utf-8');
    } catch (err) {
      this.logger.error(
        `Failed to load production index.html from ${path}: ${err}`,
      );
      throw err;
    }
  }

  private parseHtmlParts(indexFileContents: string) {
    const [beforeAppHtml, afterAppHtml] =
      indexFileContents.split('<!--app-html-->');
    const [beforeHeaderHTML, afterHeaderHTML] =
      beforeAppHtml.split('<!--app-head-->');

    const publicSsrDataScript = `<script>
      window.__PUBLIC_SSR_DATA__ = ${JSON.stringify(this.reactClientPublicData)}
    </script>`;

    return {
      beforeAppHTML: [
        beforeHeaderHTML,
        publicSsrDataScript,
        afterHeaderHTML,
      ].join(''),
      afterAppHTML: afterAppHtml,
    };
  }

  public async renderPage(url: string, res: Response): Promise<void> {
    this.logger.debug(`SSR Rendering page: ${url}`);

    if (!this.htmlParts) {
      throw new Error(`HTML not loaded from ${this.clientIndexPath}`);
    }

    const htmlParts = this.htmlParts;

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

          res.write(htmlParts.beforeAppHTML);

          transformStream.on('finish', () => {
            res.end(htmlParts.afterAppHTML);
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
        res.status(500).end(e.stack);
      } else {
        res.status(500).end(String(e));
      }
    }
  }
}

// apps/api/src/ssr/ssr.controller.ts
import { Request, Response } from 'express';
import { ReactSSRService } from './reactSSR.service';
import { Controller, Get, Req, Res } from '@nestjs/common';

@Controller()
export class ReactSSRController {
  constructor(private readonly reactSSRService: ReactSSRService) {}

  @Get('*')
  public async handleAll(@Req() req: Request, @Res() res: Response) {
    // If you have a BASE env or some route prefix, you can remove it from the url
    const base = process.env.BASE || '/';
    const url = req.originalUrl.replace(base, '');

    await this.reactSSRService.renderPage(url, res);
  }
}

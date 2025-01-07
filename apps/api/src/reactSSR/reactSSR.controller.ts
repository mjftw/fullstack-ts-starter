// apps/api/src/ssr/ssr.controller.ts
import { Request, Response } from 'express';
import { ReactSSRService } from './reactSSR.service';
import { Controller, Get, Req, Res } from '@nestjs/common';

@Controller()
export class ReactSSRController {
  constructor(private readonly reactSSRService: ReactSSRService) {}

  @Get('*')
  public async handleAll(@Req() req: Request, @Res() res: Response) {
    await this.reactSSRService.renderPage(req.originalUrl, res);
  }
}

import { Controller, Get } from '@nestjs/common';
import { HelloService } from '~/services/hello.service';

@Controller('/hello')
export class HelloController {
  constructor(private readonly helloService: HelloService) { }

  @Get()
  async getHello(): Promise<{ message: string }> {
    return await this.helloService.getHello();
  }
}

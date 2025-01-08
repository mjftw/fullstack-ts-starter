import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  async getHello(): Promise<{ message: string }> {
    return { message: 'Hello World' };
  }
}

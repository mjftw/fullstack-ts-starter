import { Injectable } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';

@Injectable()
export class Transactor {
  constructor(private readonly drizzle: DrizzleService<any>) {}

  async runInTransaction<R>(callback: () => Promise<R>): Promise<R> {
    return this.drizzle.transaction(async () => {
      return callback();
    });
  }
}

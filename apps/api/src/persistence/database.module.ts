import { Module } from '@nestjs/common';
import { DrizzleService } from './drizzle/drizzle.service';
import { Transactor } from './drizzle/transactor.service';

@Module({
  providers: [DrizzleService, Transactor],
  exports: [DrizzleService, Transactor],
})
export class DatabaseModule {}

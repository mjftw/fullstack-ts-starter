import { Module } from '@nestjs/common';
import { DrizzleService } from './drizzle/drizzle.service';
import { Transactor } from './drizzle/transactor.service';
import { DatabaseDriverService } from './driver/databaseDriver.service';

@Module({
  providers: [DatabaseDriverService, DrizzleService, Transactor],
  exports: [DrizzleService, Transactor],
})
export class DatabaseModule {}

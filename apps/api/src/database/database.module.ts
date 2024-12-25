import { Module } from '@nestjs/common';
import { DrizzleService } from './drizzle/drizzle.service';
import { Transactor } from './drizzle/transactor.service';
import { DatabaseDriverService } from './driver/databaseDriver.service';
import * as schema from './drizzle/schema';

@Module({
  providers: [
    {
      provide: DrizzleService,
      useFactory: (databaseDriver: DatabaseDriverService) => {
        return new DrizzleService(databaseDriver, schema);
      },
      inject: [DatabaseDriverService],
    },
    Transactor,
  ],
  exports: [DrizzleService, Transactor],
})
export class DatabaseModule {}

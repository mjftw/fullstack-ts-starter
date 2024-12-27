import { Module } from '@nestjs/common';
import { DrizzleService } from './drizzle/drizzle.service';
import { Transactor } from './drizzle/transactor.service';
import * as schema from './drizzle/schema';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: DrizzleService,
      useFactory: (config: ConfigService) => {
        return new DrizzleService(config, schema);
      },
      inject: [ConfigService],
    },
    Transactor,
  ],
  exports: [DrizzleService, Transactor],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { DrizzleService } from './drizzle/drizzle.service';

@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DatabaseModule {}

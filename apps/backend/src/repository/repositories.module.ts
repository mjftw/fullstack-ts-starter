import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UsersRepository } from './users/users.repository';
import { Transactor } from 'src/database/drizzle/transactor.service';

@Module({
  imports: [DatabaseModule],
  providers: [Transactor, UsersRepository],
  exports: [Transactor, UsersRepository],
})
export class RepositoriesModule { }

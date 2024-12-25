import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/persistence/database.module';
import { UsersRepository } from './users/usersRepository.service';
import { Transactor } from 'src/persistence/drizzle/transactor.service';

@Module({
  imports: [DatabaseModule],
  providers: [Transactor, UsersRepository],
  exports: [Transactor, UsersRepository],
})
export class RepositoriesModule {}

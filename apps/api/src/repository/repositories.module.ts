import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/persistence/database.module';
import { UsersRepository } from './users/usersRepository.service';

@Module({
  imports: [DatabaseModule],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class RepositoriesModule {}

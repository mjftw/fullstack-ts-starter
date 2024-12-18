import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/persistence/persistence.module';
import { UsersRepository } from './users/usersRepository.service';

@Module({
  imports: [PersistenceModule],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class RepositoriesModule {}

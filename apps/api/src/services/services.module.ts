import { Module } from '@nestjs/common';
import { UserService } from './userService';
import { RepositoriesModule } from 'src/repository/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [UserService],
  exports: [UserService],
})
export class ServicesModule {}

export type Services = {
  userService: UserService;
};

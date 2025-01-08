import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { RepositoriesModule } from 'src/repository/repositories.module';
import { HelloService } from './hello.service';

@Module({
  imports: [RepositoriesModule],
  providers: [UserService, HelloService],
  exports: [UserService, HelloService],
})
export class ServicesModule { }

export type Services = {
  userService: UserService;
  helloService: HelloService;
};

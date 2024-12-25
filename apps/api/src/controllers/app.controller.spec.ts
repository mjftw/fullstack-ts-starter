import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from '../app.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '../config/environment-variables';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate: () => validateEnv({ DATABASE_URL: 'test' }),
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      expect(await appController.getHello()).toEqual({
        message: 'Hello World',
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';

describe('DrizzleService', () => {
  let service: DrizzleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrizzleService,
        {
          provide: ConfigService,
          useValue: {
            get: vi
              .fn()
              .mockReturnValue('postgres://user:pass@localhost:5432/db'),
          },
        },
      ],
    }).compile();

    service = module.get<DrizzleService>(DrizzleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

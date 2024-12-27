<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## Database Transactions

The database layer is structured in three main components:

### Overview

This project implements a robust transaction management system using two key components:

1. `DrizzleService`: Provides low-level transaction capabilities with support for:

   - Single transactions
   - Nested transactions (uses savepoints under the hood)
   - Automatic rollback on errors
   - Transaction isolation
   - Provides database access to Repositories through its `db` property

2. `Transactor`: A higher-level abstraction that:

   - Maintains service layer isolation from database implementation
   - Enables atomic operations across multiple repositories
   - Simplifies transaction management in business logic

3. `DatabaseDriver`: The lowest-level component that:
   - Manages the raw database connection
   - Handles connection lifecycle (connect/disconnect)
   - Provides the SQL client to DrizzleService
   - Validates database configuration

### How Transactions Work

The transaction system supports:

```typescript
// Basic transaction
await transactor.runInTransaction(async () => {
  await userService.createUser(userData);
});

// Nested transactions
await transactor.runInTransaction(async () => {
  await userService.createUser(userData1);

  try {
    await transactor.runInTransaction(async () => {
      await userService.createUser(userData2);
      throw new Error('Inner transaction fails');
    });
  } catch (error) {
    // Inner transaction rolls back
    // Outer transaction can continue
  }
});
```

### Purpose of the Transactor Pattern

The Transactor pattern serves to:

1. **Maintain Layer Isolation**: Services interact with the database only through Repositories, but sometimes we need to perform multiple database actions atomically. The Transactor exists for this purpose - it allows
   Services to group database interactions taken by Repositories into transactions.
2. **Repository Access**: Repositories use DrizzleService to perform database operations
3. **Atomic Operations**: Ensures multiple repository operations either all succeed or all fail together
4. **Simplified Error Handling**: Provides consistent transaction rollback behavior across the application
5. **Testing**: Makes it easier to mock and test transactional behavior in services

## Testing

### Vitest NestJS Test Helper

The project includes a powerful test helper utility that simplifies NestJS module testing with Vitest. This helper provides a clean way to create isolated test modules with proper lifecycle management.

#### Key Features

- Creates fresh dependency injection container per test
- Handles module initialization and cleanup automatically
- Supports custom setup and teardown hooks
- Provides typed access to the testing module

#### Basic Usage

```typescript
import { createModuleTest } from 'test/utils/vitest';

describe('MyService', () => {
  const test = createModuleTest({
    providers: [MyService],
    controllers: [MyController],
  });

  test('should do something', async ({ module }) => {
    const service = module.get(MyService);
    // Test logic here
  });
});
```

#### Advanced Usage with Hooks

```typescript
const test = createModuleTest(
  {
    providers: [MyService],
    controllers: [MyController],
  },
  {
    beforeEach: async ({ module }) => {
      // Setup logic
    },
    afterEach: async ({ module }) => {
      // Cleanup logic
    },
  },
);
```

#### Mocking Dependencies

```typescript
const test = createModuleTest({
  controllers: [UsersController],
  providers: [
    {
      provide: UsersRepository,
      useValue: {
        findAll: vi.fn(),
      },
    },
  ],
});
```

For a real-world example, see the [Users controller tests](src/controllers/users.controller.spec.ts).

#### Benefits

1. **Isolation**: Each test gets a fresh module instance
2. **Type Safety**: Full TypeScript support
3. **Cleanup**: Automatic module cleanup after tests
4. **DRY**: Reduces boilerplate in test files
5. **Flexibility**: Supports both simple and complex test scenarios

The helper is particularly useful when testing components that require complex dependency injection setups or when you need to ensure complete isolation between test cases.

### Database Test Isolation

The project implements a robust database isolation strategy for testing using a template database approach. This ensures each test runs in a completely isolated database environment, preventing test interference and race conditions, and allowing tests to run concurrently.

#### How It Works

1. **Template Database Setup**

   - Before tests run, a fresh template database is created
   - All migrations are applied to this template database
   - The template is marked as a template in PostgreSQL

See [testSetup.ts](test/testSetup.ts).

2. **Per-Test Isolation**

   - Each test gets its own database cloned from the template
   - The database is created with a unique name using UUID
   - Database is automatically cleaned up after test completion

See [isolatedDrizzle.service.ts](src/database/drizzle/isolatedDrizzle.service.ts)

3. **Cleanup**

   - The isolated database is dropped after each test
   - This happens automatically in the module's destroy phase

#### Benefits

1. **True Isolation**: Each test runs in its own database, eliminating cross-test interference
2. **Performance**: Using PostgreSQL's template feature makes creating test databases extremely fast
3. **Clean State**: Every test starts with a fresh database state
4. **Parallel Safety**: Tests can run in parallel since each has its own database
5. **Automatic Cleanup**: No manual cleanup required between tests

#### Usage Example

To use isolated testing in your test files:

```typescript
import { DrizzleService } from './drizzle.service';
import { IsolatedDrizzleService } from './isolatedDrizzle.service';

describe('MyTest', () => {
  const test = createModuleTest({
    providers: [
      {
        provide: DrizzleService,
        useFactory: (config: ConfigService) => {
          return new IsolatedDrizzleService(config, schema);
        },
        inject: [ConfigService],
      },
    ],
  });

  test('should perform isolated database operations', async ({ module }) => {
    const drizzle = module.get<DrizzleService<typeof schema>>(DrizzleService);
    // Each test gets its own clean database
    // No need to clean up between tests
  });
});
```

#### Implementation Details

1. **Template Creation**: Uses PostgreSQL's native template database feature
2. **Unique Naming**: Each test database uses UUID-based naming to ensure uniqueness
3. **Transaction Support**: Full transaction support maintained in isolated databases
4. **Migration State**: All migrations are pre-applied to the template

For examples of the isolation in action, see the [IsolatedDrizzleService tests](src/database/drizzle/isolatedDrizzle.service.spec.ts).

This isolation strategy ensures reliable and maintainable tests while maintaining good performance through PostgreSQL's template feature.

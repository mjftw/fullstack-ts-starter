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

## Backend Entrypoints

The NestJS backend has multiple entrypoints, each serving different purposes:

### API Server (`entrypoints/api`)
- REST API with Swagger documentation
- tRPC endpoints for type-safe client communication
- Runs on port 5002
- Start with: `yarn dev:api` or `yarn start:api`

### Static React Server (`entrypoints/reactStatic`) 
- Serves the React SPA as static files
- Includes tRPC endpoints for data fetching
- Basic setup for serving static content
- Start with: `yarn dev:react-static` or `yarn start:react-static`

### SSR React Server (`entrypoints/reactSSR`)
- Full server-side rendering for React
- Streams rendered HTML to client
- Hydrates into interactive app
- Includes tRPC endpoints
- Configurable server-to-client data passing
- Start with: `yarn dev:react-ssr` or `yarn start:react-ssr`

### REPL (`entrypoints/repl`)
- Interactive shell for debugging and development
- Direct access to NestJS dependency injection container
- Useful for testing services and repositories
- Start with: `yarn dev:repl` or `yarn start:repl`

Each entrypoint uses the same core NestJS modules but configures them differently based on its needs.


## Running the app

```bash
# development
$ yarn dev:api

# watch mode
$ yarn dev:api

# production mode
$ yarn start:api

# run with SSR
$ yarn dev:react-ssr

# run with static file serving
$ yarn dev:react-static

# run REPL
$ yarn dev:repl
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
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

   - Before tests run, a template database is created
   - All migrations are applied to this new template database
   - The template is marked as a template in PostgreSQL, allowing new databases to be created from it
   - If a template database already exists was created from the same database migrations, this is resued rather than recreating it, for better performance
     - This works by calculating the SHA1 hash of the migrations directory and storing it in Postgres after creating the template database
     - If the hash of the migrations directory matches the hash stored in Postgres, we do not need to recreate the template database and can reuse the existing template

See [globalSetup.ts](test/globalSetup.ts).

1. **Per-Test Isolation**

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

## NestJS Devtools

The [NestJS Devtools](https://docs.nestjs.com/devtools/overview) are available to introspect the running app.
The Devtools are exposed on port 5003 when the app is running locally, and you can connect by going to https://devtools.nestjs.com/.
This does however require a paid subscription to access.

## Serving the React App

The NestJS backend is configured to serve the React frontend as static files in production. This setup allows for a single deployment while maintaining separate development environments.

### Build Process

1. Build the React app:

```bash
# Build both apps using Turborepo
yarn build
```

This creates:

- An optimized production React app build in `apps/web/dist` using Vite.
- An optimized production NestJS app build in `apps/backend/dist` using NestJS Builder (webpack).

1. The NestJS app is configured to serve these static files automatically from the `apps/web/dist` directory.

### How it Works

- NestJS uses a static file middleware configured in `src/middlewares/static.middleware.ts`
- All requests that don't match API/tRPC routes are forwarded to the React app
- This enables client-side routing to work seamlessly
- In development, you can still run both apps separately for a better development experience

### Development vs Production

In development the React app is served using Vite, making use of Hot Module Reloading (HMR).
However in production we can have the NestJS app serve the static build artefacts created by Vite.

#### Development

```bash
# Terminal 1 - Run NestJS app
$ yarn ws backend dev:react-ssr

# Terminal 2 - Run React dev server
$ yarn ws web dev
```

- The NestJS app will be available at http://localhost:5002
- The React app will be available at http://localhost:5173

#### Production

```bash
# Build both apps using Turborepo
$ yarn build

# Run the NestJS app, passing environment variables
STATIC_FILES_PATH="fullstack-ts-starter/apps/web/dist" \
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres \
node apps/api/dist/src/main.js
```

- The NestJS app will be available at http://localhost:5002
- Any routes that do not start with `/api` or `/trpc` will attempt to render a static files,
  causing the React app to be rendered at those routes.

## React App Serving Options

We have three separate methods we can use the serve the React app.

- Have the React built as static files and served separate to the NestJS server
  - For example, the React app could be built statically and served from a CDN
  - It only connects to the NestJS server at runtime to load data from via tRPC
  - This is essentially what we have when we run `yarn workspace web-ssr dev` (`vite` dev server)
- Have the React app built as static files and served by the NestJS server
  - This is not server side rendering, it just saves us needing a separate server for the React files and allows us to have a full stack setup in our NestJS app docker image
- Have the React app built as static files, but then rendered on the server rather than the client
  - This is the full React SSR setup, as described below
- [Dev-only] Bonus - we could also set up the NestJS app with Vite Hot-Module Reloading (HMR), but still server side rendered.
  - We have not implemented this, but it should be doable. An example can be found [from Vite here](https://github.com/bluwy/create-vite-extra/blob/master/template-ssr-react-streaming-ts) and [official Vite SSR docs here](https://vite.dev/guide/ssr).

## React Server-Side Rendering (SSR)

The project supports both client-side rendering (CSR) and server-side rendering (SSR) modes for the React application. SSR provides better initial page load performance and SEO benefits.

### Development Modes

You can run the app in two modes:

```bash
# Run in SSR mode (both Nest and React running together)
$ yarn start

# Run in separate CSR mode (Vite dev server + Nest server)
$ yarn dev
```

### SSR Flow

The following diagram shows how SSR works in production:

```mermaid
sequenceDiagram
    participant Browser
    participant NestJS
    participant React

    Browser->>NestJS: Request page /some-route
    NestJS->>React: Initialize React app at route /some-route
    React->>React: Render app with static data & public env vars
    React->>NestJS: Return rendered HTML
    NestJS->>Browser: Stream HTML + client bundle
    Browser->>Browser: Load client JS bundle
    Browser->>Browser: Hydrate React app
    Note over Browser: App is now interactive

    opt Lazy Loading & Data Fetching
        Browser->>NestJS: Request data via tRPC
        NestJS->>Browser: Return data
        Browser->>Browser: Render dynamic content
    end

    Browser->>Browser: Click link to /some-other-route
    Browser->>Browser: Client-side naviation
```

### Key Components

1. **Server Entry Point** (`apps/web-ssr/src/entry-server.tsx`):

   - Handles server-side rendering
   - Provides initial route matching
   - Manages static data requirements

2. **Client Entry Point** (`apps/web-ssr/src/entry-client.tsx`):

   - Handles hydration of server-rendered content
   - Initializes client-side routing
   - Sets up tRPC client

3. **NestJS SSR Module** (`apps/api/src/reactSSR/reactSSR.module.ts`):
   - Integrates React SSR into NestJS
   - Manages SSR middleware
   - Handles static file serving

### Performance Optimizations

- **Lazy Loading**: Components can be code-split and loaded on demand
- **Suspense Boundaries**: Loading states for async components
- **Static Data**: Critical data can be included in initial HTML
- **Progressive Enhancement**: App works without JS, enhances with JS

### Development Experience

In development, you can choose between:

1. **Full SSR Mode** (`yarn start`):

   - Closest to production behavior
   - Slower refresh cycles
   - Better for testing SSR-specific issues

2. **Split Mode** (`yarn dev`):
   - Faster development with Vite HMR
   - Independent backend development
   - Client-side only rendering

## Passing Environment Variables to React SSR Browser Client

In a server-side rendered (SSR) React application, you might need to expose certain environment variables to the client-side. This can be achieved with the `ReactSSRModule` in your NestJS application. The module allows you to specify which environment variables should be accessible in the browser.

### Steps to Expose Environment Variables

1. **Define Environment Variables:**

   Ensure that the environment variables you want to expose are defined in your configuration schema. For example, in `environment-variables.ts`:

   ```typescript
   import { z } from 'zod';

   export const validationSchemaForEnv = z.object({
     // We will not expose this environment variable in the browser as it contains sensitive data
     DATABASE_URL: z.string().min(1),
     // We will expose these two
     FOO: z.string().min(1),
     BAR: z.coerce.number(),
   });
   ```

2. **Register the ReactSSRModule:**

   When registering the `ReactSSRModule`, specify the keys of the environment variables you want to expose using the `browserPublicDataConfigKeys` option. This will make the specified variables available to the client-side.

   ```typescript
   import { Module } from '@nestjs/common';
   import { ReactSSRModule } from './reactSSR/reactSSR.module';

   @Module({
     imports: [
       ReactSSRModule.register({
         browserPublicDataConfigKeys: ['FOO', 'BAR'],
       }),
     ],
   })
   export class AppModule {}
   ```

3. **Accessing the Variables in the Client:**

   The exposed environment variables will be available in the global `window.__PUBLIC_SSR_DATA__` object on the client-side. You can access them as follows:

   ```javascript
   const foo = window.__PUBLIC_SSR_DATA__.FOO;
   const bar = window.__PUBLIC_SSR_DATA__.BAR;
   ```

By following these steps, you can pass environment variables from your server to the client-side of your React SSR application.
Care must be taken not to expose any data that contains secret information - any config exposed through
`browserPublicDataConfigKeys` will be public and readable in the browser.

## Environment Variables and Server-to-Client Config

The app supports passing select environment variables/config from the server to the client during the initial SSR render. This is useful for configs that need to be available immediately on page load.

### How It Works

1. **Server Setup**
```typescript
// app.module.ts
ReactSSRModule.register<EnvironmentVariables>({
  // The keys of config values from ConfigService that should be exposed to the client
  browserPublicDataConfigKeys: ['FOO', 'BAR'] 
});
```

2. **Initial Render**
- During SSR, selected config is injected into the HTML as a script tag:
```html
<script>
  window.__PUBLIC_SSR_DATA__ = {"FOO": "value", "BAR": 123}
</script>
```

3. **Client Access** 
```typescript
// Access in your React components
const publicData = window.__PUBLIC_SSR_DATA__;
const foo = publicData.FOO;
const bar = publicData.BAR;
```

A client-side hook is provided to make accessing the config values easier.
See [apps/web-ssr/src/utils/ConfigContext.tsx](../../apps/web-ssr/src/utils/ConfigContext.tsx)


### Security Considerations

- Only expose non-sensitive config via `browserPublicDataConfigKeys`
- Any values specified will be publicly visible in the HTML source
- Keep sensitive values (API keys, secrets) server-side only

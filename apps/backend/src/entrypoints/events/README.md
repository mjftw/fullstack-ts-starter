# Event Consumer Entrypoint

The event consumer system is built as a separate NestJS application entrypoint (`apps/backend/src/entrypoints/events/main.ts`), allowing us to run event consumers independently from the other entrypoints (API, React SSR, REPL, etc.).

## Architecture Overview

This application uses `@multiverse-io/events-tooling-ts` to handle event consumption from RabbitMQ. Here's how the system is structured:
### Core Components

1. **ConsumerService**: The central service that manages the lifecycle of RabbitMQ consumers
   - Initializes consumers using `events-tooling-ts`
   - Handles graceful shutdown
   - Manages consumer context and configuration

2. **Event Consumer Context**: Provides shared context and dependencies to event handlers
   - Injected into each consumer handler
   - Allows access to application services and utilities

### Startup Flow

1. The application bootstraps through `main.ts`
2. NestJS creates the application instance with `AppModule`
3. `ConsumerService` is instantiated with:
   - Consumer configuration
   - Consumer context
   - Environment configuration
4. `ConsumerService.listen()` initializes RabbitMQ consumers
5. Event handlers begin processing messages

### Shutdown Handling

The system implements graceful shutdown through:
- `OnApplicationShutdown` interface in `ConsumerService`
- Proper cleanup of RabbitMQ connections
- Logging of shutdown events

## Running Locally

The event consumer application can be run independently using:
```bash
# From the backend directory
yarn start:events
```

## Environment Configuration

The system requires proper environment configuration for:
- RabbitMQ connection details
- Environment type (local/deployed)
- Other service-specific configurations

See `.env.example` for required variables.

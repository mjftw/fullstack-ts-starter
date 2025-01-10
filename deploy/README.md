# Docker Build for NestJS + React SSR

This Dockerfile builds a production image containing both the NestJS backend and React SSR frontend. It uses a multi-stage build process to optimize the final image size.

## Deployment Model

The deployment model is such that we have:
- A single backend codebase, with many reusable Modules available
  - Each Module brings a new system capability, and is fully encapsulated and reusable
  - See the [Database Module](../apps/backend/src/database/database.module.ts) for an example - this Module provides access to the database via Drizzle ORM.
- Multiple entrypoints to the backend, each performing a different task
  - E.g. REST API, SSR React, Event Consumers
- Each entrypoint has it's own NestJS Module (Dependency Injection container), where it specifies which building blocks to use and how to configure them.
  - We can plug-in whatever Modules we need for our runtime
  - See [REST API Example module](../apps/backend/src/entrypoints/api/app.module.ts) and main [Entrypoint](../apps/backend/src/entrypoints/api/main.ts)
- The Docker image builds all of the backend code and entrypoints, and at container boot we pick an entrypoint to run
  - This allows the same docker image to run multiple different services, each doing different things, but reusing the same code
- We can deploy the Docker container multiple times, only changing the entrypoint specification for each
  - This is done by setting the `ENTRYPOINT_JS` environment variable to point to the correct entrypoint file
  - See how this works in the [Docker entrypoint script](./entrypoint.sh) 

## Multiple Entrypoints

The image supports running different NestJS entrypoints by changing the `ENTRYPOINT_JS` environment variable:

- **SSR React App**: `/app/apps/backend/dist/src/entrypoints/reactSSR/main.js`
- **Single Page React App**: `/app/apps/backend/dist/src/entrypoints/reactStatic/main.js`
- **API Server**: `/app/apps/backend/dist/src/entrypoints/api/main.js`
- **REPL**: `/app/apps/backend/dist/src/entrypoints/repl/main.js`
- **Event Consumer**: `/app/apps/backend/dist/src/entrypoints/events/main.js`

New entrypoints can be added at [apps/backend/src/entrypoints](../apps/backend/src/entrypoints), and these will be automatically available to the docker image following the path pattern `/app/apps/backend/dist/src/entrypoints/<entrypoint>/main.js`.

## Example Usage

```bash
# Build image (run from repo root)
docker build -t app -f deploy/fullstack-ssr.Dockerfile .

# Run SSR server
docker run -p 3000:3000 --add-host=host.docker.internal:host-gateway \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/postgres" \
  -e FOO=foo \
  -e BAR=42 \
  -e ENTRYPOINT_JS="/app/apps/backend/dist/src/entrypoints/reactSSR/main.js" \
  app

# Visit localhost:3000 to see the React app running

# Run API server
docker run -p 5002:5002 --add-host=host.docker.internal:host-gateway \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/postgres" \
  -e ENTRYPOINT_JS="/app/apps/backend/dist/src/entrypoints/api/main.js" \
  app

# Visit localhost:5002 to see the API server running

# Run REPL server
docker run --add-host=host.docker.internal:host-gateway \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/postgres" \
  -e ENTRYPOINT_JS="/app/apps/backend/dist/src/entrypoints/repl/main.js" \
  app

# Run Event Consumer
docker run --add-host=host.docker.internal:host-gateway \
  -e ENTRYPOINT_JS="/app/apps/backend/dist/src/entrypoints/events/main.js" \
  app
```

```markdown:deploy/README.md
# Docker Build for NestJS + React SSR

This Dockerfile builds a production image containing both the NestJS backend and React SSR frontend. It uses a multi-stage build process to optimize the final image size.

## Build Stages

1. **Base**: Node 23 Alpine base image
2. **Turbo Builder**: Adds Turbo for monorepo build orchestration
3. **Sources**: Prunes monorepo to only required packages
4. **Builder**: Builds both backend and frontend
5. **Runner**: Final stage with only production artifacts

## Environment Variables

The following env vars must be set:

```env
REACT_SSR_CLIENT_STATIC_DIR="/app/apps/web-ssr/dist/client"
REACT_SSR_CLIENT_INDEX_HTML_PATH="/app/apps/web-ssr/dist/client/index.html" 
REACT_SSR_SERVER_ENTRY_JS_PATH="/app/apps/web-ssr/dist/server/entry-server.js"
ENTRYPOINT_JS="/app/apps/backend/dist/src/entrypoints/reactSSR/main.js"
```

## Multiple Entrypoints

The image supports running different NestJS entrypoints by changing the `ENTRYPOINT_JS` environment variable:

- **SSR Server**: `/app/apps/backend/dist/src/entrypoints/reactSSR/main.js`
- **API Server**: `/app/apps/backend/dist/src/entrypoints/api/main.js`
- **Static Server**: `/app/apps/backend/dist/src/entrypoints/reactStatic/main.js`
- **REPL**: `/app/apps/backend/dist/src/entrypoints/repl/main.js`

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

# Run API server
docker run -p 5002:5002 --add-host=host.docker.internal:host-gateway \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/postgres" \
  -e ENTRYPOINT_JS="/app/apps/backend/dist/src/entrypoints/api/main.js" \
  app

# Run REPL server
docker run --add-host=host.docker.internal:host-gateway \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/postgres" \
  -e ENTRYPOINT_JS="/app/apps/backend/dist/src/entrypoints/repl/main.js" \
  app
```

The entrypoint script validates required files exist and runs the specified entrypoint.
```
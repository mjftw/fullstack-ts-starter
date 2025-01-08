# Turborepo (NestJS + Drizzle + React + Vite + tRPC + Vitest) Starter

This is fullstack turborepo starter. It comes with the following features.

- 📦 Turborepo (monorepo tooling)
- 🏗️ Nestjs (backend framework)
  - ⚙️ Env Config with Validation via Zod
  - 💾 Drizzle (ORM)
- ⚛️ React + Vite (frontend framework)
  - 🔄 Server-side rendering (SSR)
  - 📄 Single Page Application (SPA)
- 🔌 tRPC (client-server communication)
- 🧪 Testing using Vitest
  - 🎯 Concurrent isolated database testing 
- 🐘 Postgres Database
- ⚡ SWC (build)


## What's inside?

This turborepo uses [Yarn](https://classic.yarnpkg.com/lang/en/) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `backend`: a [NestJS](https://nestjs.com/) app with multiple entrypoints
- `web-static`: a [React](https://reactjs.org) + [Vite](https://vitejs.dev) app
- `web-ssr`: a [React](https://reactjs.org) + [Vite](https://vitejs.dev) app with server-side rendering (SSR)

Check out the [Backend Project Docs](apps/backend/README.md) for more detailed information.

### Utilities

This turborepo has some additional tools already setup for you:

- [Node Package Scripts](https://github.com/sezna/nps#readme) for automation scripts
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Setup

This starter kit is using turborepo and yarn workspaces for monorepo workflow.

### Prerequisites

- Install nps by running

```
npm i -g nps
```

- Make sure docker and docker-compose are
  installed. Refer to docs for your operating system.

### Configure Environment

- Frontend
  - `cd apps/web && cp .env.example .env`
  - `cd apps/web-ssr && cp .env.example .env`
- Backend
  - `cd apps/backend && cp .env.example .env`

### Install Dependencies

You can install the monorepo dependencies with:
```
yarn install
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
- Runs on port 3000
- Start with: `yarn dev:react-static` or `yarn start:react-static`

### SSR React Server (`entrypoints/reactSSR`)
- Full server-side rendering for React
- Streams rendered HTML to client
- Hydrates into interactive app
- Includes tRPC endpoints
- Configurable server-to-client data passing
- Interactive shell for debugging and development
- Start with: `yarn dev:react-ssr` or `yarn start:react-ssr`

### REPL (`entrypoints/repl`)
- Interactive shell for debugging and development
- Direct access to NestJS dependency injection container
- Useful for testing services and repositories
- Start with: `yarn dev:repl` or `yarn start:repl`

Each entrypoint uses the same core NestJS modules but configures them differently based on its needs.

## Deployment

A dockerfile is included to help build and deploy the full-stack React SSR + Nest app.
Find more info at [deploy/README.md](deploy/README.md)


## Attribution

This starter kit was originally based of the following starter kit: [fullstack-turborepo-starter](https://github.com/ejazahm3d/fullstack-turborepo-starter).

# NextJS Backend Entrypoint

This entrypoint provides a tRPC API server specifically configured for use with the NextJS frontend. While it's named "nextjs" for clarity, it's essentially a lightweight tRPC API server without any frontend serving capabilities.

## Purpose

- Serves tRPC endpoints for NextJS frontend to consume
- Runs on port 5000 by default
- Includes CORS and basic security headers via Helmet
- No static file serving or SSR capabilities (these are handled by NextJS itself)

## Usage

Start the server:
```bash
# Development
yarn dev:nextjs

# Production
yarn start:nextjs
```

## Implementation Details

The entrypoint is intentionally minimal, only including:
- tRPC middleware for API endpoints
- Basic security headers
- CORS configuration
- Logging middleware

The NextJS frontend should be run separately and configured to connect to this tRPC API server.

## Related Files

- Main entrypoint: `main.ts` in this directory
- App module: `app.module.ts` in this directory
- NextJS frontend configuration: `apps/web-next/src/app/layout.tsx`

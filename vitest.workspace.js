import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./apps/backend/vitest.config.ts",
  "./apps/backend/test/vitest-e2e.config.ts",
  "./apps/web-ssr/vite.config.ts",
  "./apps/web-static/vite.config.ts",
]);


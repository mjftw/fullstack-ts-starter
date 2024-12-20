import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./apps/api/vitest.config.ts",
  "./apps/api/test/vitest-e2e.config.ts",
  "./apps/web/vite.config.ts",
]);

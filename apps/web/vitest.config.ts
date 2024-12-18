import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    setupFiles: ["test/testUtils/testSetup.ts"],
    environmentMatchGlobs: [
      // All frontend tests will run with jsdom environment
      ["**/*.test.{tsx,jsx}", "jsdom"],
      // All backend tests will run with node environment
      ["**/*.test.{ts,js}", "node"],
    ],
    exclude: ["**/node_modules/**", "**/dist/**"],
    css: true,
  },
});

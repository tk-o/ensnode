import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: [resolve(__dirname, "test", "vitest.setup.ts")],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});

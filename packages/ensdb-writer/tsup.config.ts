import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/adapter.ts", "src/schema.ts", "src/types.ts"],
  platform: "neutral",
  format: ["esm", "cjs"],
  target: "es2022",
  bundle: true,
  splitting: false,
  sourcemap: true,
  dts: true,
  clean: true,
  external: ["viem", "drizzle-orm", "ponder"],
  outDir: "./dist",
});

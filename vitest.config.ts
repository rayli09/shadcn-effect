import { defineConfig } from "vitest/config";

// Test layout follows the Effect-TS/ui repo's shape, shrunk to one package:
// tests live in tests/**, and vitest.setup.ts registers @effect/vitest's
// equality testers (the upstream setup file, verbatim in spirit).
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
});

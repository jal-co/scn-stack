import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    globals: false,
    // Integration tests spawn the CLI and run installs — give them room.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});

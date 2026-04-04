import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    globals: true,
    // Fork workers occasionally hit startup timeouts on Windows; threads are more reliable here.
    pool: "threads",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fix "No such built-in module: node:*" in Vercel/CI (deps may use node: prefix)
      "node:crypto": "crypto",
      "node:buffer": "buffer",
    },
  },
});

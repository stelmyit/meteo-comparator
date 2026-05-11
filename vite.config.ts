import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "automatic"
  },
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000"
    }
  },
  test: {
    coverage: {
      all: true,
      exclude: [
        "coverage/**",
        "dist/**",
        "dist-server/**",
        "node_modules/**",
        "server/index.ts",
        "src/main.tsx",
        "src/types/**",
        "server/weather/types.ts",
        "**/*.config.js",
        "**/*.config.ts",
        "**/*.d.ts"
      ],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90
      }
    },
    environment: "jsdom",
    exclude: ["coverage/**", "dist/**", "dist-server/**", "node_modules/**"],
    globals: true,
    setupFiles: "./src/test/setup.ts"
  }
});

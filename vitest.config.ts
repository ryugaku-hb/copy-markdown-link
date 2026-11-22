import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  /**
   * 与 vite.config.ts 保持一致的 `@` 别名，测试里可以直接引用 `@/domain/...`。
   */
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  test: {
    /**
     * 纯逻辑与服务层测试都不需要 DOM，
     * 使用 node 环境可以避免加载 jsdom 带来的额外开销。
     */
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});

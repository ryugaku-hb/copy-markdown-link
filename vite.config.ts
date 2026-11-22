import tailwindcss from "@tailwindcss/vite"; // 插件，用于集成 Tailwind CSS。
import { resolve } from "path";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html"; // 插件，用于处理 HTML 文件。

export default defineConfig({
  /**
   * 项目根目录。
   *
   * 设为 `src` 而不是默认的项目根目录，让源码与构建产物分离，
   * 也让 `src/public` 直接作为静态资源目录。
   */
  root: "src",

  /**
   * 构建配置。
   */
  build: {
    /**
     * 输出目录。
     *
     * 相对于 `root` 指定的 `src` 目录，因此写到项目根下的 `dist`。
     */
    outDir: "../dist",
    /**
     * 每次构建前清空输出目录，确保 `dist` 里只有最新文件。
     */
    emptyOutDir: true,
    /**
     * 生产构建不生成 source map，减小产物体积；
     * 需要调试弹窗时可在本地临时改为 `true`。
     */
    sourcemap: false,

    /**
     * Rollup 构建选项。
     */
    rollupOptions: {
      /**
       * 多入口配置。
       *
       * - `popup`：扩展弹窗页面；
       * - `background`：后台服务工作线程。
       */
      input: {
        // 扩展弹窗页面入口。
        popup: resolve(__dirname, "src/popup/popup.html"),
        // 后台服务工作线程入口。
        background: resolve(__dirname, "src/background.ts"),
      },
      /**
       * 输出配置。
       */
      output: {
        /**
         * 入口文件命名函数。
         *
         * 按入口名分别命名：后台脚本必须是固定文件名，弹窗放进子目录，
         * 其余共享 chunk 加哈希以便缓存失效。
         *
         * @param chunkInfo - Rollup 提供的 chunk 信息，用其中的 `name` 判断入口。
         * @returns 输出文件名模板。
         * @example
         * // background → "background.js"
         * // popup      → "popup/popup.js"
         * // 其他 chunk  → "vendor-abc123.js"
         */
        entryFileNames(chunkInfo) {
          // 后台脚本使用简单命名，便于 Chrome 扩展识别。
          if (chunkInfo.name === "background") return "[name].js";
          // 弹窗相关文件放在 popup 子目录下，便于组织管理。
          if (chunkInfo.name === "popup") return "popup/[name].js";
          // 其他通用模块使用带哈希值的命名，实现缓存失效。
          return "[name]-[hash].js";
        },
      },
    },
  },

  /**
   * 路径解析配置。
   */
  resolve: {
    /**
     * 路径别名映射。
     *
     * `@` 指向 `src`，跨层引用统一写成 `@/domain/xxx`、`@/services/xxx`；
     * TypeScript 侧由 `tsconfig.json` 的 `paths` 同步维护。
     */
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  /**
   * 构建插件列表。
   */
  plugins: [
    /**
     * HTML 插件：处理并压缩 `popup.html`。
     */
    createHtmlPlugin({
      minify: true,
    }),
    /**
     * Tailwind CSS 插件：提供实用优先的样式类。
     */
    tailwindcss(),
  ],
});

import tailwindcss from "@tailwindcss/vite"; // 插件，用于集成 Tailwind CSS
import { resolve } from "path";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html"; // 插件，用于处理 HTML 文件

export default defineConfig({
  /**
   * 项目根目录设置
   * 将源代码根目录设置为 src 文件夹，而不是默认的项目根目录
   * 这样可以将构建输出与源代码分离，保持项目结构清晰
   */
  root: "src",

  /**
   * 构建配置
   * 定义输出目录、清理策略和源码映射等构建相关选项
   */
  build: {
    /**
     * 输出目录
     * 指定构建结果输出到上级目录的 dist 文件夹
     * 相对于 root 指定的 src 目录
     */
    outDir: "../dist",
    /**
     * 清空输出目录
     * 每次构建前自动清空输出目录，确保只包含最新的构建文件
     */
    emptyOutDir: true,
    /**
     * 源码映射
     * 生产环境下禁用 source map，减小构建体积
     * 开发环境建议启用以便调试
     */
    sourcemap: false,
    
    /**
     * Rollup 构建选项
     * 配置多入口文件和输出文件名规则
     */
    rollupOptions: {
      /**
       * 多入口配置
       * 定义多个构建入口点，适用于 Chrome 扩展的不同部分
       * - popup: 扩展弹窗界面
       * - background: 后台脚本
       */
      input: {
        // 扩展弹窗页面入口
        popup: resolve(__dirname, "src/popup/popup.html"),
        // 后台服务工作线程入口
        background: resolve(__dirname, "src/background.ts"),
      },
      /**
       * 输出配置
       * 自定义输出文件的命名规则，便于管理和识别不同模块
       */
      output: {
        /**
         * 入口文件命名函数
         * 根据不同的入口模块采用不同的命名策略
         * @param {Object} chunkInfo - 代码块信息对象
         * @returns {string} - 返回文件名格式
         */
        entryFileNames(chunkInfo) {
          // 后台脚本使用简单命名，便于 Chrome 扩展识别
          if (chunkInfo.name === "background") return "[name].js";
          // 弹窗相关文件放在 popup 子目录下，便于组织管理
          if (chunkInfo.name === "popup") return "popup/[name].js";
          // 其他通用模块使用带哈希值的命名，实现缓存失效
          return "[name]-[hash].js";
        },
      },
    },
  },

  /**
   * 路径解析配置
   * 配置模块路径别名，简化长路径引用，提高开发效率
   */
  resolve: {
    /**
     * 路径别名映射
     * 将常用路径映射为简短的别名，避免相对路径的复杂嵌套
     */
    alias: {
      /**
       * @popup 别名
       * 映射到 src/popup/modules 目录
       * 便于在项目中直接使用 @popup/xxx 的方式引用弹窗模块
       */
      "@popup": resolve(__dirname, "src/popup/modules"),
    },
  },

  /**
   * 插件配置数组
   * 定义项目所需的构建插件
   */
  plugins: [
    /**
     * HTML 插件配置
     * 处理 HTML 文件，包括压缩等功能
     */
    createHtmlPlugin({
      minify: true,
    }),
    /**
     * Tailwind CSS 插件
     * 集成 Tailwind CSS 框架，提供实用优先的 CSS 类名
     */
    tailwindcss(),
  ],
});

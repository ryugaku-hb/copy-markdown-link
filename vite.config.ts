import { defineConfig } from "vite";
import { resolve } from "path";
import { createHtmlPlugin } from "vite-plugin-html"; // 插件，用于处理 HTML 文件
import tailwindcss from "@tailwindcss/vite"; // 插件，用于集成 Tailwind CSS

export default defineConfig({
  root: "src", // 设置项目的源代码根目录为 src，默认值是项目根目录，即 process.cwd()
  build: {
    outDir: "../dist", // 指定输出路径（相对于 root）
    emptyOutDir: true, // 构建前清空输出目录
    sourcemap: false, // 构建后生成 source map 文件，便于调试
    rollupOptions: {
      // 指定多个入口文件
      input: {
        popup: resolve(__dirname, "src/popup/popup.html"),
        background: resolve(__dirname, "src/background.ts"),
      },
      output: {
        entryFileNames(chunkInfo) {
          if (chunkInfo.name === "background") return "[name].js";
          if (chunkInfo.name === "popup") return "popup/[name].js";
          return "[name]-[hash].js";
        },
      },
    },
  },
  resolve: {
    // 路径别名配置
    alias: {
      "@popup": resolve(__dirname, "src/popup/modules"), // @ 代表 src 目录，便于导入
    },
  },
  // 插件配置
  plugins: [
    createHtmlPlugin({
      minify: true, // 压缩 HTML 文件
    }),
    tailwindcss(), // 集成 Tailwind CSS
  ],
});

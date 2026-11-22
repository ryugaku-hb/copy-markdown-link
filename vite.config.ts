import tailwindcss from "@tailwindcss/vite"; // 插件，用于集成 Tailwind CSS。
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "path";
import { defineConfig, type Plugin } from "vite";
import { createHtmlPlugin } from "vite-plugin-html"; // 插件，用于处理 HTML 文件。

/**
 * 递归删除构建产物里的 macOS 垃圾文件。
 *
 * `src/public` 目录会被原样复制进 `dist`，本地 Finder 生成的 `.DS_Store`
 * 也会跟着进去；这类文件对扩展无用，还会被打进发布 zip，因此在构建末尾清掉。
 *
 * @param dir - 要清理的目录绝对路径。
 * @example
 * // 删除 dist/ 及所有子目录中的 .DS_Store
 * removeMacJunk(resolve(__dirname, "dist"));
 */
function removeMacJunk(dir: string): void {
  // 目录不存在时（例如构建中断）直接跳过，不抛错。
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    // 子目录继续深入，文件则按名字判断是否为垃圾文件。
    if (entry.isDirectory()) {
      removeMacJunk(fullPath);
      continue;
    }
    if (entry.name === ".DS_Store" || entry.name.startsWith("._")) {
      rmSync(fullPath, { force: true });
    }
  }
}

/**
 * 读取 `package.json` 里的版本号，作为扩展版本的唯一来源。
 *
 * @returns 形如 `1.1.2` 的版本字符串。
 */
function readPackageVersion(): string {
  // 直接读文件而不 import，避免把整个 package.json 打进构建配置。
  const raw = readFileSync(resolve(__dirname, "package.json"), "utf-8");
  const parsed = JSON.parse(raw) as { version?: unknown };
  // 版本号缺失时直接失败，避免产出一个版本为 undefined 的扩展。
  if (typeof parsed.version !== "string" || parsed.version === "") {
    throw new Error("package.json 缺少合法的 version 字段");
  }
  return parsed.version;
}

/**
 * 构建时把 `package.json` 的版本号写入 `dist/manifest.json`。
 *
 * `src/public/manifest.json` 里的 version 因此只是占位值，改版本只需
 * `npm version patch|minor|major`，不用再手动同步两处。
 *
 * @returns Vite 插件对象，仅在 `vite build` 阶段生效。
 * @example
 * // dist/manifest.json 的 version 将等于 package.json 的 version
 */
function injectManifestVersion(): Plugin {
  return {
    name: "inject-manifest-version",
    // 只在构建时生效，开发服务器不需要改写源码里的 manifest。
    apply: "build",
    // `closeBundle` 在所有文件（含 publicDir 复制）写完后执行，此时 manifest 已就位。
    closeBundle() {
      const distDir = resolve(__dirname, "dist");
      // 先清掉 publicDir 复制过来的 macOS 垃圾文件，再改写 manifest。
      removeMacJunk(distDir);
      const manifestPath = resolve(distDir, "manifest.json");
      const manifest = JSON.parse(
        readFileSync(manifestPath, "utf-8"),
      ) as Record<string, unknown>;
      manifest.version = readPackageVersion();
      writeFileSync(
        manifestPath,
        `${JSON.stringify(manifest, null, 2)}\n`,
        "utf-8",
      );
    },
  };
}

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
       * 入口配置。
       *
       * 只有一个入口：扩展弹窗页面。复制逻辑全部在弹窗内完成，
       * 扩展不需要后台 Service Worker，因此不再打包 `background`。
       */
      input: {
        // 扩展弹窗页面入口。
        popup: resolve(__dirname, "src/popup/popup.html"),
      },
      /**
       * 输出配置。
       */
      output: {
        /**
         * 入口文件命名函数。
         *
         * 弹窗放进子目录，其余共享 chunk 加哈希以便缓存失效。
         *
         * @param chunkInfo - Rollup 提供的 chunk 信息，用其中的 `name` 判断入口。
         * @returns 输出文件名模板。
         * @example
         * // popup      → "popup/popup.js"
         * // 其他 chunk  → "vendor-abc123.js"
         */
        entryFileNames(chunkInfo) {
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
    /**
     * 版本注入插件：让 manifest 的 version 与 package.json 保持一致。
     */
    injectManifestVersion(),
  ],
});

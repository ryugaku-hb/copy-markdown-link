/**
 * 把 `dist/` 打包成可直接上传 Chrome Web Store 的 zip。
 *
 * Web Store 要求 `manifest.json` 位于 zip 根目录，因此这里按相对路径逐个
 * 追加 `dist` 里的文件，而不是把 `dist` 目录本身塞进包里。产物输出到
 * `release/copy-markdown-link-<version>.zip`，版本号取自 `package.json`。
 *
 * @example
 * // npm run package → release/copy-markdown-link-1.1.2.zip
 */
import { ZipArchive } from "archiver";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(projectRoot, "dist");
const releaseDir = join(projectRoot, "release");

/**
 * 递归收集目录下的所有文件绝对路径。
 *
 * @param dir - 起始目录。
 * @returns 该目录下所有文件的绝对路径列表。
 */
function collectFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectFiles(fullPath));
    } else {
      result.push(fullPath);
    }
  }
  return result;
}

// 没构建过就直接报错，避免打出一个空包。
if (!existsSync(distDir) || statSync(distDir).isDirectory() === false) {
  console.error("找不到 dist/，请先执行 npm run build");
  process.exit(1);
}

const pkg = JSON.parse(
  readFileSync(join(projectRoot, "package.json"), "utf-8"),
);
if (typeof pkg.version !== "string" || pkg.version === "") {
  console.error("package.json 缺少合法的 version 字段");
  process.exit(1);
}

mkdirSync(releaseDir, { recursive: true });
const zipPath = join(releaseDir, `copy-markdown-link-${pkg.version}.zip`);
const output = createWriteStream(zipPath);
const archive = new ZipArchive({ zlib: { level: 9 } });

// 写文件出错（例如磁盘满）时明确失败，不要静默结束。
output.on("close", () => {
  console.log(
    `已生成 ${relative(projectRoot, zipPath)}（${archive.pointer()} 字节）`,
  );
});
archive.on("error", (error) => {
  console.error("打包失败:", error.message);
  process.exit(1);
});
archive.pipe(output);

// 用相对 dist 的路径作为包内路径，manifest.json 才能落在 zip 根目录。
for (const file of collectFiles(distDir)) {
  archive.file(file, { name: relative(distDir, file) });
}

await archive.finalize();

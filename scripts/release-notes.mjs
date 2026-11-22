/**
 * 按提交前缀生成分类好的 Release 说明。
 *
 * 从上一个 `v*` 标签（含）到 `HEAD` 之间取提交标题，按 `feat:` / `fix:` 等
 * 前缀归类，输出 Markdown 到标准输出，供发布工作流写成 `body_path`。
 * 取不到上一个标签时（首个版本）退化为列出全部提交。
 *
 * 环境变量 `GITHUB_REPOSITORY` 用于生成提交链接，缺失时只输出短哈希。
 *
 * @example
 * // node scripts/release-notes.mjs > RELEASE_NOTES.md
 */
import { execSync } from "node:child_process";

/** 提交前缀到「标题 + 顺序」的映射，顺序决定输出章节的先后。 */
const SECTIONS = [
  { type: "feat", title: "新功能" },
  { type: "fix", title: "修复" },
  { type: "perf", title: "性能" },
  { type: "refactor", title: "重构" },
  { type: "docs", title: "文档" },
  { type: "test", title: "测试" },
  { type: "ci", title: "构建与发布" },
  { type: "build", title: "构建与发布" },
  { type: "chore", title: "其他改动" },
  { type: "style", title: "其他改动" },
];

/** 未命中任何前缀时的归类标题。 */
const FALLBACK_TITLE = "其他改动";

/**
 * 执行一条 git 命令并返回去掉首尾空白的输出。
 *
 * @param command - 要执行的命令。
 * @returns 命令的标准输出。
 */
function git(command) {
  return execSync(command, { encoding: "utf-8" }).trim();
}

/**
 * 取上一个版本标签名。
 *
 * 用 `HEAD^` 而不是 `HEAD`，避免把当前正在发布的标签自己当成上一个版本。
 *
 * @returns 形如 `v1.1.1` 的标签名，取不到时返回空字符串。
 */
function getPreviousTag() {
  for (const rev of ["HEAD^", "HEAD"]) {
    try {
      const tag = git(`git describe --tags --abbrev=0 --match "v*" ${rev}`);
      if (tag) return tag;
    } catch {
      // 当前提交还没有任何 v* 标签（例如首个版本），继续尝试或返回空。
    }
  }
  return "";
}

/**
 * 取提交列表，形如 `{ hash, subject }`。
 *
 * @param sinceTag - 起始标签（不含）；传空字符串表示取全部提交。
 * @returns 提交数组，按时间从新到旧。
 */
function getCommits(sinceTag) {
  const range = sinceTag ? `${sinceTag}..HEAD` : "HEAD";
  const raw = git(`git log ${range} --no-merges --pretty=format:%h%x09%s`);
  if (!raw) return [];
  return raw.split("\n").map((line) => {
    const [hash, ...rest] = line.split("\t");
    return { hash, subject: rest.join("\t").trim() };
  });
}

/**
 * 把提交标题拆成前缀与描述。
 *
 * 识别 `feat: xxx`、`feat(scope): xxx` 两种写法；无符合前缀时前缀为空。
 *
 * @param subject - 提交标题。
 * @returns 前缀（小写）与去掉前缀后的描述。
 */
function splitSubject(subject) {
  const matched = subject.match(/^(\w+)(?:\([^)]*\))?!?:\s*(.*)$/);
  if (!matched) return { type: "", description: subject };
  return { type: matched[1].toLowerCase(), description: matched[2] || subject };
}

/**
 * 生成单个提交的列表项文本。
 *
 * @param commit - 提交对象。
 * @param description - 去掉类型前缀后的描述。
 * @returns 形如 `- 描述 ([abc1234](链接))` 的一行。
 */
function formatItem(commit, description) {
  const repo = process.env.GITHUB_REPOSITORY;
  const link = repo ? `https://github.com/${repo}/commit/${commit.hash}` : "";
  return link
    ? `- ${description} ([${commit.hash}](${link}))`
    : `- ${description} (${commit.hash})`;
}

/**
 * 主流程：归类提交并输出 Markdown。
 */
function main() {
  const previousTag = getPreviousTag();
  const commits = getCommits(previousTag);
  if (commits.length === 0) {
    console.log("本次发布没有新的提交。");
    return;
  }

  // 按前缀分组；同一标题可能对应多个前缀（如 build 与 ci），只保留首次映射。
  const titleByType = new Map();
  for (const section of SECTIONS) {
    if (!titleByType.has(section.type))
      titleByType.set(section.type, section.title);
  }

  const groups = new Map();
  for (const commit of commits) {
    const { type, description } = splitSubject(commit.subject);
    const title = titleByType.get(type) ?? FALLBACK_TITLE;
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push(formatItem(commit, description));
  }

  // 按 SECTIONS 里出现的顺序输出章节，未知章节排在最后。
  const orderedTitles = [...new Set(SECTIONS.map((s) => s.title))];
  const lines = [];
  for (const title of orderedTitles) {
    const items = groups.get(title);
    if (!items || items.length === 0) continue;
    lines.push(`### ${title}`, "", ...items, "");
  }

  if (previousTag) {
    const repo = process.env.GITHUB_REPOSITORY;
    // 用标签名而不是 HEAD，对比链接才会显示成 v1.1.1...v1.1.3。
    const headRef = process.env.GITHUB_REF_NAME || "HEAD";
    const compare = repo
      ? `https://github.com/${repo}/compare/${previousTag}...${headRef}`
      : "";
    lines.push(
      compare
        ? `**完整对比**：[${previousTag}...${headRef}](${compare})`
        : `**完整对比**：${previousTag}...${headRef}`,
    );
  } else {
    lines.push("**首个发布版本**");
  }

  console.log(lines.join("\n"));
}

main();

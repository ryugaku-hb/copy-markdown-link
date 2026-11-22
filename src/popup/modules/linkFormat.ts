/**
 * 链接格式管理模块 \
 * 定义和管理各种链接格式的生成规则
 */

/**
 * 可用的链接格式类型枚举
 */
export type LinkFormatType =
  | "markdown"
  | "markdownTitle"
  | "emptyText"
  | "plain"
  | "html";

/**
 * 默认链接格式配置
 */
export const DEFAULT_LINK_FORMAT: LinkFormatType = "markdown";

/**
 * 判断一个值是否为合法的 `LinkFormatType`
 * 使用类型守卫 (Type Guard) 确保类型安全
 *
 * @param value - 要验证的值
 * @returns 如果是有效的链接格式类型则返回 `true`，否则返回 `false`
 */
export function isLinkFormat(value: unknown): value is LinkFormatType {
  return (
    typeof value === "string" &&
    ["markdown", "markdownTitle", "emptyText", "plain", "html"].includes(value)
  );
}

/**
 * 链接数据接口 \
 * 定义生成链接所需的基本信息
 */
interface LinkData {
  /** 页面标题 */
  title: string;
  /** 页面 URL */
  url: string;
}

/**
 * 链接格式定义接口
 */
export interface LinkFormat {
  /**
   * 在下拉框中显示的标签文本 \
   * 用于向用户展示格式的示例
   */
  label: string;

  /**
   * 根据页面信息生成最终链接文本的函数
   * @param data - 包含标题和 URL 的数据对象
   * @returns 格式化后的链接文本
   */
  generate: (data: LinkData) => string;
}

/**
 * 转义 Markdown 链接的显示文本 \
 * 标题里的反斜杠、`[`、`]` 会破坏 `[title](url)` 结构，需要加反斜杠转义
 */
function escapeMarkdownText(text: string): string {
  return text.replace(/[\\\[\]]/g, "\\$&");
}

/**
 * 处理 Markdown 链接的目标地址 \
 * 含空格、括号或尖括号时用 `<...>` 包裹（CommonMark 允许这种写法），
 * 否则保持原样，避免复制结果里凭空多出尖括号
 */
function formatMarkdownUrl(url: string): string {
  if (!/[\s()<>]/.test(url)) return url;

  // `<...>` 内部不能再出现尖括号，用百分号编码替代
  return `<${url.replace(/</g, "%3C").replace(/>/g, "%3E")}>`;
}

/**
 * 转义 Markdown title 属性的值 \
 * `[title](url "title")` 里的 `"` 必须转义，否则属性会被提前截断
 */
function escapeMarkdownTitle(title: string): string {
  return title.replace(/[\\"]/g, "\\$&");
}

/** HTML 实体映射，文本与属性值通用 */
const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * 转义 HTML \
 * 标题含 `"` 会截断 title 属性，含 `&`、`<` 会产出非法 HTML，必须转义
 */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/**
 * 链接格式注册表 \
 * 定义所有可用的链接格式及其生成规则；所有 generate 都会对标题和 URL 转义，
 * 保证任意页面标题都能产出可用链接
 */
export const linkFormats: Record<LinkFormatType, LinkFormat> = {
  /**
   * Markdown 格式: [title](url)
   */
  markdown: {
    label: "[title](url)",
    generate: ({ title, url }: LinkData): string =>
      `[${escapeMarkdownText(title)}](${formatMarkdownUrl(url)})`,
  },

  /**
   * Markdown 格式（带标题属性）: [title](url "title")
   */
  markdownTitle: {
    label: '[title](url "title")',
    generate: ({ title, url }: LinkData): string =>
      `[${escapeMarkdownText(title)}](${formatMarkdownUrl(url)} "${escapeMarkdownTitle(title)}")`,
  },
  /**
   * 空文本链接格式: [](url "title")
   */
  emptyText: {
    label: '[](url "title")',
    generate: ({ title, url }: LinkData): string =>
      `[](${formatMarkdownUrl(url)} "${escapeMarkdownTitle(title)}")`,
  },

  /**
   * 纯 URL 格式: url
   */
  plain: {
    label: "url",
    generate: ({ url }: LinkData): string => url,
  },

  /**
   * HTML 链接格式: <a href='url' title='title'>title</a>
   */
  html: {
    label: "<a href='url' title='title'>title</a>",
    generate: ({ title, url }: LinkData): string =>
      `<a href="${escapeHtml(url)}" title="${escapeHtml(title)}">${escapeHtml(title)}</a>`,
  },
};

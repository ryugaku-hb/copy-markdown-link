/**
 * 链接格式领域模块。
 *
 * 纯逻辑层：负责类型定义、转义规则与格式注册表，
 * 不依赖 DOM 与 chrome API，可以直接单测。
 */

/**
 * 可用的链接格式类型。
 */
export type LinkFormatType =
  | "markdown"
  | "markdownTitle"
  | "emptyText"
  | "plain"
  | "html";

/**
 * 默认链接格式，首次使用或存储值非法时回退到它。
 */
export const DEFAULT_LINK_FORMAT: LinkFormatType = "markdown";

/**
 * 生成链接所需的页面信息。
 */
export interface LinkData {
  /** 页面标题，可能包含换行或特殊字符。 */
  title: string;
  /** 页面 URL，取自当前活动标签页。 */
  url: string;
}

/**
 * 链接格式定义接口。
 */
export interface LinkFormat {
  /**
   * 下拉框中显示的标签文本，用于向用户展示格式示例。
   */
  label: string;

  /**
   * 根据页面信息生成最终链接文本。
   *
   * @param data - 页面标题与 URL。
   * @returns 已转义、可直接写入剪贴板的链接文本。
   * @example
   * linkFormats.markdown.generate({
   *   title: "Example",
   *   url: "https://example.com",
   * });
   * // => "[Example](https://example.com)"
   */
  generate: (data: LinkData) => string;
}

/**
 * 转义 Markdown 链接的显示文本。
 *
 * 标题里的反斜杠、`[`、`]` 会破坏 `[title](url)` 结构，必须加反斜杠转义。
 *
 * @param text - 原始标题文本。
 * @returns 转义后的文本，可直接放进 `[...]` 中。
 * @example
 * escapeMarkdownText("a[b]c"); // => "a\[b\]c"
 */
function escapeMarkdownText(text: string): string {
  return text.replace(/[\\\[\]]/g, "\\$&");
}

/**
 * 处理 Markdown 链接的目标地址。
 *
 * 含空格、括号或尖括号时用 `<...>` 包裹（CommonMark 允许这种写法）；
 * 否则保持原样，避免复制结果里凭空多出尖括号。
 *
 * @param url - 原始页面 URL。
 * @returns 可直接放进 `(...)` 的地址文本。
 * @example
 * formatMarkdownUrl("https://example.com/a(b)c");
 * // => "<https://example.com/a(b)c>"
 */
function formatMarkdownUrl(url: string): string {
  if (!/[\s()<>]/.test(url)) return url;

  // `<...>` 内部不能再出现尖括号，改用百分号编码替代。
  return `<${url.replace(/</g, "%3C").replace(/>/g, "%3E")}>`;
}

/**
 * 转义 Markdown title 属性的值。
 *
 * `[title](url "title")` 中的双引号必须转义，否则属性会被提前截断。
 *
 * @param title - 原始标题文本。
 * @returns 转义后的文本，可直接放进 `"..."` 中。
 * @example
 * escapeMarkdownTitle('say "hi"'); // => 'say \"hi\"'
 */
function escapeMarkdownTitle(title: string): string {
  return title.replace(/[\\"]/g, "\\$&");
}

/** HTML 实体映射表，文本节点与属性值通用。 */
const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * 转义 HTML 特殊字符。
 *
 * 标题含双引号会截断 title 属性，含 `&`、`<` 会产出非法 HTML，必须转义。
 *
 * @param text - 原始文本（标题或 URL）。
 * @returns 可安全插入 HTML 文本或属性值的字符串。
 * @example
 * escapeHtml('a<b>&"'); // => "a&lt;b&gt;&amp;&quot;"
 */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/**
 * 链接格式注册表。
 *
 * 定义所有可用格式及其生成规则；每项 `generate` 都会对标题和 URL 转义，
 * 保证任意页面标题都能产出可用链接。新增格式时只需在这里加一项，
 * 下拉框与类型校验会自动同步。
 */
export const linkFormats: Record<LinkFormatType, LinkFormat> = {
  /**
   * Markdown 格式：`[title](url)`。
   */
  markdown: {
    label: "[title](url)",
    generate: ({ title, url }: LinkData): string =>
      `[${escapeMarkdownText(title)}](${formatMarkdownUrl(url)})`,
  },

  /**
   * Markdown 格式（带 title 属性）：`[title](url "title")`。
   */
  markdownTitle: {
    label: '[title](url "title")',
    generate: ({ title, url }: LinkData): string =>
      `[${escapeMarkdownText(title)}](${formatMarkdownUrl(url)} "${escapeMarkdownTitle(title)}")`,
  },

  /**
   * 空文本链接格式：`[](url "title")`，显示文本为空、悬停展示标题。
   */
  emptyText: {
    label: '[](url "title")',
    generate: ({ title, url }: LinkData): string =>
      `[](${formatMarkdownUrl(url)} "${escapeMarkdownTitle(title)}")`,
  },

  /**
   * 纯 URL 格式：只保留地址，不做任何修饰。
   */
  plain: {
    label: "url",
    generate: ({ url }: LinkData): string => url,
  },

  /**
   * HTML 链接格式：`<a href="url" title="title">title</a>`。
   */
  html: {
    label: "<a href='url' title='title'>title</a>",
    generate: ({ title, url }: LinkData): string =>
      `<a href="${escapeHtml(url)}" title="${escapeHtml(title)}">${escapeHtml(title)}</a>`,
  },
};

/**
 * 判断一个值是否为合法的 `LinkFormatType`。
 *
 * 直接以注册表的键为准：新增格式时这里无需同步修改，避免两处清单漂移；
 * 使用 `hasOwnProperty` 而非 `in`，可以排除 `toString` 这类原型链上的键。
 *
 * @param value - 待校验的值，通常来自 `chrome.storage` 或下拉框。
 * @returns 是合法格式时返回 `true`，否则返回 `false`。
 * @example
 * isLinkFormat("markdownTitle"); // => true
 * isLinkFormat("url"); // => false
 * isLinkFormat("toString"); // => false
 */
export function isLinkFormat(value: unknown): value is LinkFormatType {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(linkFormats, value)
  );
}

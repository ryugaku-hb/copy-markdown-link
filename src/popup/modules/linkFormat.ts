/**
 * 可用的链接格式键
 */
export type LinkFormatType =
  | "markdown"
  | "markdownTitle"
  | "emptyText"
  | "plain"
  | "html";

/**
 * 判断一个值是否为合法的 LinkFormatType
 */
export function isLinkFormat(value: unknown): value is LinkFormatType {
  return (
    typeof value === "string" &&
    ["markdown", "markdownTitle", "emptyText", "plain", "html"].includes(value)
  );
}

/**
 * 默认的链接格式键
 */
export const DEFAULT_LINK_FORMAT: LinkFormatType = "markdown";

/**
 * 单个链接格式的定义
 */
export interface LinkFormat {
  /**
   * 下拉框中显示的示例文本
   * */
  label: string;
  /**
   * 根据页面信息生成最终文本
   */
  generate: (data: { title: string; url: string }) => string;
}

/**
 * 链接格式注册表
 *
 * Record 用于定义一个键值对对象，键为 `LinkFormatType`，值为 `LinkFormat` 对象
 */
export const linkFormats: Record<LinkFormatType, LinkFormat> = {
  markdown: {
    label: "[title](url)",
    generate: ({ title, url }) => `[${title}](${url})`,
  },

  markdownTitle: {
    label: '[title](url "title")',
    generate: ({ title, url }) => `[${title}](${url} "${title}")`,
  },

  emptyText: {
    label: '[](url "title")',
    generate: ({ title, url }) => `[](${url} "${title}")`,
  },

  plain: {
    label: "url",
    generate: ({ url }) => url,
  },

  html: {
    label: "<a href='url' title='title'>title</a>",
    generate: ({ title, url }) =>
      `<a href="${url}" title="${title}">${title}</a>`,
  },
};

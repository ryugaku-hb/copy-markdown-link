/**
 * 可用的链接格式键
 */
export type LinkFormatKey =
  | "markdown"
  | "markdownTitle"
  | "emptyText"
  | "plain"
  | "html";

/**
 * 判断一个值是否为 LinkFormatKey
 * @param {any} value 任意值
 * @returns {value is LinkFormatKey} 是否是合法的链接格式键
 */
export function isLinkFormatKey(value: any): value is LinkFormatKey {
  return ["markdown", "markdownTitle", "emptyText", "plain", "html"].includes(
    value,
  );
}

/** 默认的链接格式键 */
export const DEFAULT_FORMAT: LinkFormatKey = "markdown";

/**
 * 链接格式接口
 * @property {string} label - 格式标签，用于下拉框显示
 * @property {(data: { title: string; url: string }) => string} generate - 生成格式化字符串的函数
 */
export interface LinkFormat {
  /** 格式标签 */
  label: string;
  /**
   * 生成格式化字符串的函数
   * @param data.title 页面标题
   * @param data.url 页面链接
   * @returns 格式化后的字符串
   */
  generate: (data: { title: string; url: string }) => string;
}

/**
 * 定义各种链接格式及其生成逻辑
 * 
 * Record 用于定义一个键值对对象，键为 `LinkFormatKey`，值为 `LinkFormat` 对象
 */
export const linkFormats: Record<LinkFormatKey, LinkFormat> = {
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

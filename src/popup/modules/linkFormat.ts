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
 * 链接格式注册表 \
 * 定义所有可用的链接格式及其生成规则
 */
export const linkFormats: Record<LinkFormatType, LinkFormat> = {
  /**
   * Markdown 格式: [title](url)
   */
  markdown: {
    label: "[title](url)",
    generate: ({ title, url }: LinkData): string => `[${title}](${url})`,
  },

  /**
   * Markdown 格式（带标题属性）: [title](url "title")
   */
  markdownTitle: {
    label: '[title](url "title")',
    generate: ({ title, url }: LinkData): string =>
      `[${title}](${url} "${title}")`,
  },
  /**
   * 空文本链接格式: [](url "title")
   */
  emptyText: {
    label: '[](url "title")',
    generate: ({ title, url }: LinkData): string => `[](${url} "${title}")`,
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
      `<a href="${url}" title="${title}">${title}</a>`,
  },
};

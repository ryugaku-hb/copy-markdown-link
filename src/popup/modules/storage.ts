import {
  LinkFormatType,
  DEFAULT_LINK_FORMAT,
  isLinkFormat,
} from "./linkFormat";

const KEYS = {
  format: "linkFormat",
  prefix: "prefix",
  suffix: "suffix",
} as const;

const DEFAULT_PREFIX = "";
const DEFAULT_SUFFIX = "";

/** 前缀和后缀的类型定义 */
interface PrefixSuffix {
  prefix: string;
  suffix: string;
}

export const storage = {
  /**
   * 获取存储中的链接格式值
   */
  async getLinkFormat(): Promise<LinkFormatType> {
    const { [KEYS.format]: format } = await chrome.storage.local.get(
      KEYS.format,
    );
    return isLinkFormat(format) ? format : DEFAULT_LINK_FORMAT;
  },

  /**
   * 设置链接格式到存储
   */
  async setLinkFormat(format: LinkFormatType): Promise<void> {
    await chrome.storage.local.set({ [KEYS.format]: format });
  },

  /**
   * 获取存储中的前缀和后缀
   */
  async getPrefixSuffix(): Promise<PrefixSuffix> {
    const { [KEYS.prefix]: prefix, [KEYS.suffix]: suffix } =
      await chrome.storage.local.get([KEYS.prefix, KEYS.suffix]);
    return {
      prefix: typeof prefix === "string" ? prefix : DEFAULT_PREFIX,
      suffix: typeof suffix === "string" ? suffix : DEFAULT_SUFFIX,
    };
  },

  /**
   * 设置前缀和后缀到存储
   */
  async setPrefixSuffix(prefix: string, suffix: string): Promise<void> {
    await chrome.storage.local.set({
      [KEYS.prefix]: prefix,
      [KEYS.suffix]: suffix,
    });
  },
};

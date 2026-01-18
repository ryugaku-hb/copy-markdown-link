import { LinkFormatKey, DEFAULT_FORMAT, isLinkFormatKey } from "./formatter";

/**
 * 存储键常量，避免直接写字符串，提高可维护性
 */
const KEYS = {
  format: "linkFormat",
  prefix: "prefix",
  suffix: "suffix",
};

/**
 * 默认值，当存储中没有数据时使用
 */
const DEFAULTS = {
  format: DEFAULT_FORMAT, // 默认链接格式
  prefix: "", // 默认前缀为空
  suffix: "", // 默认后缀为空
};

/**
 * 获取存储中的链接格式值
 * @returns {Promise<string>} 当前保存的链接格式，如果不存在则返回默认格式
 */
export async function getLinkFormat(): Promise<LinkFormatKey> {
  const { [KEYS.format]: formatKey } = await chrome.storage.local.get(
    KEYS.format,
  );
  return isLinkFormatKey(formatKey) ? formatKey : DEFAULT_FORMAT;
}

/**
 * 设置链接格式到存储
 * @param value 链接格式值
 * @returns {Promise<void>}
 */
export async function setLinkFormat(value: LinkFormatKey): Promise<void> {
  await chrome.storage.local.set({ [KEYS.format]: value });
}

/** 前缀和后缀的类型定义 */
export interface PrefixSuffix {
  prefix: string;
  suffix: string;
}

/**
 * 获取存储中的前缀和后缀
 * @returns {Promise<PrefixSuffix>} 当前保存的前缀和后缀，如果不存在则返回默认值
 */
export async function getPrefixSuffix(): Promise<PrefixSuffix> {
  const { [KEYS.prefix]: prefix, [KEYS.suffix]: suffix } =
    await chrome.storage.local.get([KEYS.prefix, KEYS.suffix]);
  return {
    prefix: typeof prefix === "string" ? prefix : DEFAULTS.prefix,
    suffix: typeof suffix === "string" ? suffix : DEFAULTS.suffix,
  };
}

/**
 * 设置前缀和后缀到存储
 * @param prefix 前缀字符串
 * @param suffix 后缀字符串
 * @returns {Promise<void>}
 */
export async function setPrefixSuffix(
  prefix: string,
  suffix: string,
): Promise<void> {
  await chrome.storage.local.set({
    [KEYS.prefix]: prefix,
    [KEYS.suffix]: suffix,
  });
}

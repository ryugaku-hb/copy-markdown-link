/**
 * 存储管理模块 \
 * 负责管理扩展的本地存储配置，使用泛型实现通用的存取逻辑
 */

import {
  DEFAULT_LINK_FORMAT,
  isLinkFormat,
  LinkFormatType,
} from "./linkFormat";

/** 存储键名常量，统一管理 Key 防止拼写错误 */
const STORAGE_KEYS = {
  LINK_FORMAT: "linkFormat",
  PREFIX: "prefix",
  SUFFIX: "suffix",
} as const;

/** 默认前缀值 */
const DEFAULT_PREFIX = "";
/** 默认后缀值 */
const DEFAULT_SUFFIX = "";

/**
 * 通用内部处理函数：保存任意类型的配置
 * @template T - 配置值的类型
 * @param key - 存储键名，用于在 `chrome.storage` 中定位数据
 * @param value - 要保存的配置值，可以是字符串、数字、对象等任意类型
 * @throws 如果保存失败，抛出包含错误信息的 Error
 * @returns 保存操作完成后的 Promise
 */
async function _setConfig<T>(key: string, value: T): Promise<void> {
  try {
    await chrome.storage.local.set({ [key]: value });
  } catch (error: unknown) {
    throw new Error(`保存配置 ${key} 失败`);
  }
}

/**
 * 通用内部处理函数：获取配置并进行类型校验 \
 * 从存储中读取数据，如果数据不存在或校验失败，则返回默认值
 * @template T - 配置值的类型
 * @param key - 存储键名
 * @param defaultValue - 当存储中无数据或数据校验失败时返回的默认值
 * @param validator - 校验函数，接收存储中的原始值，返回布尔值表示数据是否合法
 * @returns 解析并校验后的配置值 Promise
 */
async function _getConfig<T>(
  key: string,
  defaultValue: T,
  validator: (val: unknown) => boolean,
): Promise<T> {
  try {
    const result = await chrome.storage.local.get(key);
    const value = result[key];

    // 使用传入的校验函数验证数据，通过则返回数据，否则返回默认值
    return validator(value) ? (value as T) : defaultValue;
  } catch (error: unknown) {
    console.error(`获取配置 ${key} 失败:`, error);
    return defaultValue;
  }
}

/**
 * 存储管理器 \
 * 对外暴露的配置管理接口
 */
export const storage = {
  // --- 前缀相关 ---

  /**
   * 获取存储中的前缀设置
   * @returns 前缀文本字符串，如果未设置则返回空字符串
   */
  getPrefix(): Promise<string> {
    return _getConfig(
      STORAGE_KEYS.PREFIX,
      DEFAULT_PREFIX,
      (val): val is string => typeof val === "string",
    );
  },
  /**
   * 保存前缀设置到本地存储
   * @param prefix - 要保存的前缀文本
   * @returns 保存操作完成后的 Promise
   */
  setPrefix(prefix: string): Promise<void> {
    return _setConfig(STORAGE_KEYS.PREFIX, prefix);
  },

  // --- 后缀相关 ---

  /**
   * 获取存储中的后缀设置
   * @returns 后缀文本字符串，如果未设置则返回空字符串
   */
  getSuffix(): Promise<string> {
    return _getConfig(
      STORAGE_KEYS.SUFFIX,
      DEFAULT_SUFFIX,
      (val): val is string => typeof val === "string",
    );
  },
  /**
   * 保存后缀设置到本地存储
   * @param suffix - 要保存的后缀文本
   * @returns 保存操作完成后的 Promise
   */
  setSuffix(suffix: string): Promise<void> {
    return _setConfig(STORAGE_KEYS.SUFFIX, suffix);
  },

  // --- 链接格式相关 ---

  /**
   * 获取存储中的链接格式设置 \
   * 如果存储中不存在该设置，或数据校验失败（不再是合法的 `LinkFormatType`），则返回默认格式
   * @returns 存储的链接格式类型，默认为 `"markdown"`
   */
  async getLinkFormat(): Promise<LinkFormatType> {
    return _getConfig(
      STORAGE_KEYS.LINK_FORMAT,
      DEFAULT_LINK_FORMAT,
      isLinkFormat,
    );
  },
  /**
   * 设置链接格式到本地存储
   *
   * @param format - 要存储的链接格式类型，必须是合法的 `LinkFormatType`
   * @returns 保存操作完成后的 Promise
   */
  async setLinkFormat(format: LinkFormatType): Promise<void> {
    return _setConfig(STORAGE_KEYS.LINK_FORMAT, format);
  },
};

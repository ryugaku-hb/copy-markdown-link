/**
 * 存储管理模块 \
 * 一次性读写整份设置，减少 chrome.storage 往返次数
 */

import {
  DEFAULT_LINK_FORMAT,
  isLinkFormat,
  LinkFormatType,
} from "./linkFormat";

/**
 * 设置项结构
 */
export interface Settings {
  /** 链接前缀 */
  prefix: string;
  /** 链接后缀 */
  suffix: string;
  /** 链接格式 */
  linkFormat: LinkFormatType;
}

/** 默认设置，同时用作 `chrome.storage.local.get` 的默认值 */
const DEFAULT_SETTINGS: Settings = {
  prefix: "",
  suffix: "",
  linkFormat: DEFAULT_LINK_FORMAT,
};

/**
 * 存储管理器 \
 * 对外暴露整份设置的读取与保存
 */
export const storage = {
  /**
   * 一次读取全部设置 \
   * `chrome.storage.local.get` 支持传入默认值对象：缺失的键自动补上默认值，
   * 因此一次 IPC 就能拿到完整设置（而不是每项各读一次）。
   *
   * @returns 校验后的完整设置；读取失败时回退为默认设置
   */
  async getSettings(): Promise<Settings> {
    try {
      // 传入对象字面量作为默认值：缺失的键由 chrome.storage 自动补齐
      const stored = await chrome.storage.local.get({
        prefix: DEFAULT_SETTINGS.prefix,
        suffix: DEFAULT_SETTINGS.suffix,
        linkFormat: DEFAULT_SETTINGS.linkFormat,
      });

      // 存储里的值可能被旧版本写入或被手动改动，逐项校验
      return {
        prefix:
          typeof stored.prefix === "string"
            ? stored.prefix
            : DEFAULT_SETTINGS.prefix,
        suffix:
          typeof stored.suffix === "string"
            ? stored.suffix
            : DEFAULT_SETTINGS.suffix,
        linkFormat: isLinkFormat(stored.linkFormat)
          ? stored.linkFormat
          : DEFAULT_LINK_FORMAT,
      };
    } catch (error: unknown) {
      console.error("读取设置失败，使用默认设置:", error);
      return { ...DEFAULT_SETTINGS };
    }
  },

  /**
   * 一次写入全部设置
   *
   * @param settings - 完整设置对象
   * @throws {Error} 写入失败时抛出，调用方负责提示用户
   */
  async saveSettings(settings: Settings): Promise<void> {
    try {
      await chrome.storage.local.set(settings);
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`保存设置失败：${detail}`);
    }
  },
};

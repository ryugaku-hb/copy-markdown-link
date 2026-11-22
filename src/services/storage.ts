/**
 * 存储服务。
 *
 * 一次性读写整份设置，减少 `chrome.storage` 往返次数；
 * 读取时做校验，避免旧版本写入的非法值污染界面。
 */

import { DEFAULT_LINK_FORMAT, isLinkFormat } from "@/domain/linkFormat";
import { DEFAULT_SETTINGS, Settings } from "@/domain/settings";

/**
 * 存储管理器，对外暴露整份设置的读取与保存。
 */
export const storage = {
  /**
   * 一次读取全部设置。
   *
   * `chrome.storage.local.get` 支持传入默认值对象：缺失的键会自动补上默认值，
   * 因此一次 IPC 就能拿到完整设置，而不是每项各读一次。
   *
   * @returns 校验后的完整设置；读取失败时回退为默认设置。
   * @example
   * const settings = await storage.getSettings();
   * // => { prefix: "", suffix: "", linkFormat: "markdown" }
   */
  async getSettings(): Promise<Settings> {
    try {
      // 传入对象字面量作为默认值：缺失的键由 chrome.storage 自动补齐。
      const stored = await chrome.storage.local.get({
        prefix: DEFAULT_SETTINGS.prefix,
        suffix: DEFAULT_SETTINGS.suffix,
        linkFormat: DEFAULT_SETTINGS.linkFormat,
      });

      // 存储值可能来自旧版本或被手动改动，逐项校验后再返回。
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
   * 一次写入全部设置。
   *
   * @param settings - 完整的设置对象，包含前缀、后缀与链接格式。
   * @returns 写入完成后 resolve，无返回值。
   * @throws {Error} 写入失败时抛出，错误信息包含原始原因，调用方负责提示用户。
   * @example
   * await storage.saveSettings({ prefix: "★ ", suffix: "", linkFormat: "markdown" });
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

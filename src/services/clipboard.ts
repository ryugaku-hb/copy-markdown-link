/**
 * 剪贴板服务。
 *
 * 对 Clipboard API 做薄封装：成功时正常返回，失败时抛出 `AppError`，
 * 由调用方（ui 层）按当前语言翻译并提示用户。
 */

import { AppError } from "@/domain/errors";

/**
 * 将文本写入系统剪贴板。
 *
 * @param text - 要复制的文本内容。
 * @returns 写入成功后 resolve，无返回值。
 * @throws {TypeError} 参数不是字符串时抛出（属于调用方编程错误，不做翻译）。
 * @throws {AppError} 当前环境不支持 Clipboard API，或写入被浏览器拒绝时抛出。
 * @example
 * try {
 *   await copyText("[Example](https://example.com)");
 * } catch (error) {
 *   feedback.showStatus(localizeError(error, locale), "error");
 * }
 */
export async function copyText(text: string): Promise<void> {
  // 参数校验：避免把非字符串写进剪贴板后才发现问题。
  if (typeof text !== "string") {
    throw new TypeError("参数 text 必须是字符串类型");
  }

  // Clipboard API 需要安全上下文，扩展页面与 https 页面满足条件。
  if (!navigator.clipboard) {
    throw new AppError("clipboard_unsupported", "当前环境不支持 Clipboard API");
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error: unknown) {
    // 必须把失败抛出去：吞掉错误会让调用方误报“复制成功”。
    console.error("复制到剪贴板失败:", error);
    throw new AppError("clipboard_write_failed", "写入剪贴板失败，请重试");
  }
}

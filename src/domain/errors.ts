/**
 * 应用错误领域模块。
 *
 * 底层服务抛出带错误码的 `AppError`，界面层再按当前语言翻译成用户文案；
 * 这样同一个错误在任何语言下都能正确展示，而不必把中文写死在服务层。
 */

import { Locale, MessageKey, t } from "./i18n";

/**
 * 可翻译的错误码。
 *
 * - `protected_page`：受保护页面无法读取标题或 URL；
 * - `clipboard_unsupported`：当前环境没有 Clipboard API；
 * - `clipboard_write_failed`：写入剪贴板被拒绝；
 * - `save_settings_failed`：写入 `chrome.storage` 失败；
 * - `invalid_link_format`：下拉框给出了非法格式值。
 */
export type ErrorCode =
  | "protected_page"
  | "clipboard_unsupported"
  | "clipboard_write_failed"
  | "save_settings_failed"
  | "invalid_link_format";

/**
 * 支持国际化的应用错误。
 *
 * `message` 保留一份可读的中文兜底文案（便于日志与调试），
 * `code` 用于界面层查表翻译，`detail` 承载格式化参数。
 */
export class AppError extends Error {
  /**
   * @param code - 错误码，决定界面展示哪条文案。
   * @param message - 兜底文案，用于日志输出。
   * @param detail - 附加信息，会替换文案中的 `{detail}` 或 `{format}`。
   */
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly detail?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** 错误码到文案键的映射。 */
const ERROR_MESSAGE_KEYS: Record<ErrorCode, MessageKey> = {
  protected_page: "errorProtectedPage",
  clipboard_unsupported: "errorClipboardUnsupported",
  clipboard_write_failed: "errorClipboardWriteFailed",
  save_settings_failed: "errorSaveSettingsFailed",
  invalid_link_format: "errorInvalidFormat",
};

/**
 * 把任意错误翻译成当前语言下的用户文案。
 *
 * - `AppError`：按错误码取对应文案，并替换 `{detail}` / `{format}`；
 * - 普通 `Error`：直接返回其 `message`（通常来自浏览器，保持原文）；
 * - 其他值：转成字符串。
 *
 * @param error - 捕获到的任意错误。
 * @param locale - 当前界面语言。
 * @returns 可直接展示给用户的文案。
 * @example
 * catch (error) {
 *   feedback.showPreview(localizeError(error, locale));
 * }
 */
export function localizeError(error: unknown, locale: Locale): string {
  if (error instanceof AppError) {
    return t(locale, ERROR_MESSAGE_KEYS[error.code], {
      detail: error.detail ?? "",
      format: error.detail ?? "",
    });
  }

  if (error instanceof Error) return error.message;

  return String(error);
}

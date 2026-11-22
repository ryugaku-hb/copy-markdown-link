/**
 * 界面文案应用层。
 *
 * 把 `domain/i18n` 的文案表写到 DOM 上：静态文本走 `data-i18n`，
 * 输入框占位符走 `data-i18n-placeholder`，无障碍标签走 `data-i18n-aria-label`。
 * 这样 HTML 里不散落硬编码字符串，新增语言只需在文案表里补一份。
 */

import { isMessageKey, Locale, t } from "@/domain/i18n";

/**
 * 按指定语言刷新页面上的全部静态文案。
 *
 * 同时更新 `<html lang>` 与页面标题；动态内容（状态提示、预览、下拉选项）
 * 由各自的模块负责。
 *
 * @param locale - 目标界面语言。
 * @returns 无返回值。
 * @example
 * applyLocale(settings.locale);
 */
export function applyLocale(locale: Locale): void {
  document.documentElement.lang = locale;
  document.title = t(locale, "appName");

  // 静态文本节点：<h1>、<label>、按钮文字等。
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (isMessageKey(key)) el.textContent = t(locale, key);
  });

  // 输入框占位符。
  document
    .querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]")
    .forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (isMessageKey(key)) el.placeholder = t(locale, key);
    });

  // 无可见文字控件的无障碍标签。
  document
    .querySelectorAll<HTMLElement>("[data-i18n-aria-label]")
    .forEach((el) => {
      const key = el.dataset.i18nAriaLabel;
      if (isMessageKey(key)) el.setAttribute("aria-label", t(locale, key));
    });
}

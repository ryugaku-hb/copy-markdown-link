/**
 * 设置表单层。
 *
 * 负责把设置渲染到表单、把表单内容读回为强类型对象；
 * 只操作 DOM，不直接访问 chrome API，因此易于替换和测试。
 */

import { AppError } from "@/domain/errors";
import { DEFAULT_LOCALE, Locale, LOCALE_NAMES } from "@/domain/i18n";
import { isLinkFormat, linkFormats } from "@/domain/linkFormat";
import type { Settings } from "@/domain/settings";
import { elements } from "./elements";

/**
 * 当前选中的界面语言。
 *
 * 语言由右上角弹出菜单维护，没有原生 `<select>` 可以作为唯一数据源，
 * 因此在这里保存一份状态，供 `readSettings()` 读取。
 */
let currentLocale: Locale = DEFAULT_LOCALE;

/**
 * 重建语言菜单项，并把当前语言标记为选中。
 *
 * 每个选项都是原生单选框（`input[type=radio]`），
 * 因此方向键切换、屏幕阅读器朗读等行为都由浏览器负责。
 */
function renderLocaleMenuItems(): void {
  elements.localeMenu.innerHTML = "";

  Object.entries(LOCALE_NAMES).forEach(([code, name]) => {
    const active = code === currentLocale;

    const item = document.createElement("label");
    item.className = [
      "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs",
      active ? "font-medium text-gray-900" : "text-gray-600",
      "hover:bg-gray-100",
    ].join(" ");

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "locale";
    radio.value = code;
    radio.checked = active;
    radio.className = "accent-emerald-600";

    const text = document.createElement("span");
    text.textContent = name;

    item.append(radio, text);
    elements.localeMenu.appendChild(item);
  });
}

/**
 * 设置表单控制器，统一管理语言菜单、格式下拉框与前后缀输入框。
 */
export const settingsForm = {
  /**
   * 渲染右上角语言弹出菜单。
   *
   * 选项按 `LOCALE_NAMES` 生成，显示名使用各语言自身的写法，
   * 便于用户在自己的语言里找到对应条目。
   *
   * @returns 无返回值。
   * @example
   * settingsForm.renderLocaleMenu();
   */
  renderLocaleMenu(): void {
    renderLocaleMenuItems();
  },

  /**
   * 更新当前语言并刷新菜单的选中态。
   *
   * 只改内部状态和菜单样式，不接触存储；持久化由调用方负责。
   *
   * @param locale - 新的界面语言。
   * @returns 无返回值。
   * @example
   * settingsForm.setLocale("ja");
   */
  setLocale(locale: Locale): void {
    currentLocale = locale;
    renderLocaleMenuItems();
  },

  /**
   * 用格式注册表渲染“链接格式”下拉框。
   *
   * 先清空现有选项再按 `linkFormats` 重建，新增格式时界面会自动同步。
   *
   * @returns 无返回值。
   * @example
   * settingsForm.renderFormatOptions();
   */
  renderFormatOptions(): void {
    // 清空现有选项，防止重复初始化时出现重复条目。
    elements.formatSelect.innerHTML = "";

    Object.entries(linkFormats).forEach(([type, format]) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = format.label;
      elements.formatSelect.appendChild(option);
    });
  },

  /**
   * 把已加载的设置回填到表单。
   *
   * @param settings - 从存储读出的完整设置。
   * @returns 无返回值。
   * @example
   * settingsForm.applySettings(await storage.getSettings());
   */
  applySettings(settings: Settings): void {
    elements.prefixInput.value = settings.prefix;
    elements.suffixInput.value = settings.suffix;
    elements.formatSelect.value = settings.linkFormat;
    currentLocale = settings.locale;
    renderLocaleMenuItems();
  },

  /**
   * 读取表单内容并校验链接格式。
   *
   * 返回值可直接用于生成链接和持久化，因此调用前无需再做额外校验。
   *
   * @returns 强类型的完整设置对象。
   * @throws {AppError} 下拉框的值不是合法格式时抛出。
   * @example
   * const settings = settingsForm.readSettings();
   * // => { prefix: "★ ", suffix: "", linkFormat: "markdown", locale: "ja" }
   */
  readSettings(): Settings {
    const format = elements.formatSelect.value;

    if (!isLinkFormat(format)) {
      throw new AppError(
        "invalid_link_format",
        `无效的链接格式: ${format}`,
        format,
      );
    }

    return {
      prefix: elements.prefixInput.value,
      suffix: elements.suffixInput.value,
      linkFormat: format,
      locale: currentLocale,
    };
  },
};

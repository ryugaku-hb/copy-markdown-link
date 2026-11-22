/**
 * Popup 应用编排层。
 *
 * 把表单、存储、当前页面与剪贴板等能力组装起来，
 * 只负责流程控制、语言菜单交互与错误提示，具体细节交给各下层模块。
 */

import { localizeError } from "@/domain/errors";
import { DEFAULT_LOCALE, isLocale, Locale, t } from "@/domain/i18n";
import { linkFormats } from "@/domain/linkFormat";
import { copyText } from "@/services/clipboard";
import { getCurrentPageInfo } from "@/services/currentPage";
import { storage } from "@/services/storage";
import { elements } from "./elements";
import { feedback } from "./feedback";
import { applyLocale } from "./localize";
import { settingsForm } from "./settingsForm";

/**
 * Popup 应用。
 *
 * 负责启动页面、绑定事件，并编排复制流程、语言菜单与语言切换流程。
 */
export class PopupApp {
  /** 当前界面语言；加载设置后更新，切换语言时同步。 */
  private locale: Locale = DEFAULT_LOCALE;

  /** 语言弹出菜单是否处于打开状态。 */
  private menuOpen = false;

  /**
   * 启动应用。
   *
   * 顺序：读取设置 → 渲染语言菜单与格式选项 → 应用界面语言 → 回填表单 → 绑定事件。
   * 初始化过程中的错误会以状态提示和预览的形式反馈，不会向外抛出。
   *
   * @returns 初始化完成后 resolve，无返回值。
   * @example
   * const popupApp = new PopupApp();
   * await popupApp.init();
   */
  async init(): Promise<void> {
    try {
      const settings = await storage.getSettings();
      this.locale = settings.locale;

      settingsForm.renderLocaleMenu();
      settingsForm.renderFormatOptions();
      applyLocale(this.locale);
      settingsForm.applySettings(settings);

      this.bindEvents();
    } catch (error: unknown) {
      feedback.showStatus(t(this.locale, "statusInitFailed"), "warning");
      feedback.showPreview(localizeError(error, this.locale));
    }
  }

  /**
   * 绑定页面上的全部交互事件。
   *
   * 包括复制按钮、语言按钮与菜单，以及点击外部、按 Esc 关闭菜单。
   *
   * @returns 无返回值。
   */
  private bindEvents(): void {
    elements.copyBtn.addEventListener("click", () => {
      void this.handleCopy();
    });

    elements.localeBtn.addEventListener("click", () => {
      this.toggleLocaleMenu();
    });

    // 选中任意一项后立刻收起菜单（单选框的 change 事件随后触发语言切换）。
    elements.localeMenu.addEventListener("click", (event) => {
      const target = event.target as Element | null;
      if (target?.closest("label")) this.toggleLocaleMenu(false);
    });

    elements.localeMenu.addEventListener("change", (event) => {
      void this.handleLocaleMenuChange(event);
    });

    // 点击菜单与按钮之外的区域时收起菜单。
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        elements.localeBtn.contains(target) ||
        elements.localeMenu.contains(target)
      ) {
        return;
      }
      this.toggleLocaleMenu(false);
    });

    // Esc 关闭菜单，符合弹出层的通用习惯。
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.menuOpen) {
        this.toggleLocaleMenu(false);
        elements.localeBtn.focus();
      }
    });
  }

  /**
   * 打开或关闭语言弹出菜单。
   *
   * @param open - 目标状态；不传则在当前状态上取反。
   * @returns 无返回值。
   * @example
   * this.toggleLocaleMenu(true);  // 打开
   * this.toggleLocaleMenu(false); // 关闭
   */
  private toggleLocaleMenu(open: boolean = !this.menuOpen): void {
    this.menuOpen = open;
    elements.localeMenu.classList.toggle("hidden", !open);
    elements.localeBtn.setAttribute("aria-expanded", String(open));
  }

  /**
   * 处理语言菜单中的选择变化。
   *
   * @param event - 菜单容器上冒泡的 `change` 事件。
   * @returns 语言切换与保存完成后 resolve，无返回值。
   * @example
   * // 由 #localeMenu 的 change 事件触发，无需手动调用。
   */
  private async handleLocaleMenuChange(event: Event): Promise<void> {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    const locale = target.value;
    if (!isLocale(locale)) return;

    this.toggleLocaleMenu(false);
    await this.handleLocaleChange(locale);
  }

  /**
   * 应用并保存新的界面语言。
   *
   * 立即刷新文案并隐藏旧的提示/预览，避免出现两种语言混排；
   * 语言属于即时生效的偏好，因此这里立即写入存储，
   * 而不是像前后缀那样等到点击复制时才保存。
   *
   * @param locale - 新的界面语言。
   * @returns 保存完成后 resolve，无返回值。
   * @example
   * await this.handleLocaleChange("ko");
   */
  private async handleLocaleChange(locale: Locale): Promise<void> {
    try {
      settingsForm.setLocale(locale);
      this.locale = locale;

      applyLocale(this.locale);
      feedback.hideStatus();
      feedback.hidePreview();

      await storage.saveSettings(settingsForm.readSettings());
    } catch (error: unknown) {
      feedback.showStatus(localizeError(error, this.locale), "warning");
    }
  }

  /**
   * 处理复制按钮点击。
   *
   * 流程：读取表单 → 懒保存设置 → 读取当前页 → 生成链接文本 →
   * 写入剪贴板 → 展示成功提示与预览。
   * 任一步失败都会展示当前语言下的错误状态，并在预览区给出具体原因。
   *
   * @returns 复制流程结束后 resolve，无返回值。
   * @example
   * // 私有方法，仅由 init() 中绑定的按钮点击事件调用。
   */
  private async handleCopy(): Promise<void> {
    try {
      const settings = settingsForm.readSettings();
      this.locale = settings.locale;

      // 懒保存：只在真正复制时写一次存储，避免改动设置时频繁写盘。
      await storage.saveSettings(settings);

      const page = await getCurrentPageInfo();
      const baseText = linkFormats[settings.linkFormat].generate(page);
      const finalText = `${settings.prefix}${baseText}${settings.suffix}`;

      await copyText(finalText);

      feedback.showStatus(t(this.locale, "statusCopied"), "success");
      feedback.showPreview(finalText);
    } catch (error: unknown) {
      feedback.showStatus(t(this.locale, "statusCopyFailed"), "error");
      feedback.showPreview(localizeError(error, this.locale));
    }
  }
}

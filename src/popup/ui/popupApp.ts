/**
 * Popup 应用编排层。
 *
 * 把表单、存储、当前页面与剪贴板等能力组装起来，
 * 只负责流程控制与错误提示，具体细节交给各下层模块。
 */

import { linkFormats } from "@/domain/linkFormat";
import { copyText } from "@/services/clipboard";
import { getCurrentPageInfo } from "@/services/currentPage";
import { storage } from "@/services/storage";
import { elements } from "./elements";
import { feedback } from "./feedback";
import { settingsForm } from "./settingsForm";

/**
 * Popup 应用。
 *
 * 负责启动页面、绑定事件，并编排一次完整的复制流程。
 */
export class PopupApp {
  /**
   * 启动应用。
   *
   * 按顺序执行：渲染格式选项 → 回填已保存的设置 → 绑定复制按钮事件。
   * 初始化过程中的错误会直接以状态提示和预览的形式反馈给用户，不会向外抛出。
   *
   * @returns 初始化完成后 resolve，无返回值。
   * @example
   * const popupApp = new PopupApp();
   * await popupApp.init();
   */
  async init(): Promise<void> {
    try {
      settingsForm.renderFormatOptions();
      settingsForm.applySettings(await storage.getSettings());
      elements.copyBtn.addEventListener("click", () => {
        void this.handleCopy();
      });
    } catch (error: unknown) {
      feedback.showStatus("Popup 初始化失败", "warning");
      if (error instanceof Error) {
        feedback.showPreview(error.message);
      }
    }
  }

  /**
   * 处理复制按钮点击。
   *
   * 流程：读取表单 → 懒保存设置 → 读取当前页 → 生成链接文本 →
   * 写入剪贴板 → 展示成功提示与预览。
   * 任一步失败都会展示错误状态，并在预览区给出具体原因。
   *
   * @returns 复制流程结束后 resolve，无返回值。
   * @example
   * // 私有方法，仅由 init() 中绑定的按钮点击事件调用。
   */
  private async handleCopy(): Promise<void> {
    try {
      const settings = settingsForm.readSettings();

      // 懒保存：只在真正复制时写一次存储，避免改动设置时频繁写盘。
      await storage.saveSettings(settings);

      const page = await getCurrentPageInfo();
      const baseText = linkFormats[settings.linkFormat].generate(page);
      const finalText = `${settings.prefix}${baseText}${settings.suffix}`;

      await copyText(finalText);

      feedback.showStatus("已复制到剪贴板 ✓", "success");
      feedback.showPreview(finalText);
    } catch (error: unknown) {
      feedback.showStatus("复制失败，请重试！", "error");
      if (error instanceof Error) {
        feedback.showPreview(error.message);
      }
    }
  }
}

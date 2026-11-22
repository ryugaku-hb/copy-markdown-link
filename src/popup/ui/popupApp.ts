/**
 * Popup 应用编排层 \
 * 把表单、存储、当前页面、剪贴板等能力组装起来，只负责流程与错误提示
 */

import { linkFormats } from "@/domain/linkFormat";
import { copyText } from "@/services/clipboard";
import { getCurrentPageInfo } from "@/services/currentPage";
import { storage } from "@/services/storage";
import { elements } from "./elements";
import { feedback } from "./feedback";
import { settingsForm } from "./settingsForm";

/**
 * Popup 应用 \
 * 负责启动页面、绑定事件并编排一次完整的复制流程
 */
export class PopupApp {
  /**
   * 启动应用：渲染选项 → 回填设置 → 绑定事件
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
   * 处理复制按钮点击 \
   * 流程：读表单 → 懒保存设置 → 读当前页 → 生成文本 → 写剪贴板 → 反馈
   */
  private async handleCopy(): Promise<void> {
    try {
      const settings = settingsForm.readSettings();

      // 懒保存：只在真正复制时写一次存储
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

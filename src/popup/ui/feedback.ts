/**
 * 反馈展示层。
 *
 * 只负责状态提示与预览区域的显示、隐藏和样式切换，不关心业务逻辑，
 * 也不直接读写存储或标签页。
 */

import { elements } from "./elements";

/** 状态类型，对应 `STATUS_COLORS` 的键名。 */
type StatusType = keyof typeof STATUS_COLORS;

/** 状态颜色映射，对应 `popup.css` 里的语义类名。 */
const STATUS_COLORS = {
  success: "status-success",
  error: "status-error",
  warning: "status-warning",
} as const;

/**
 * 反馈展示器，统一管理状态提示与预览区域。
 */
export const feedback = {
  /**
   * 显示状态信息。
   *
   * 提示会一直保留到下一条提示或显式调用 `hideStatus()`，
   * 不自动消失，避免下方预览框因提示消失而上移。
   *
   * @param message - 要显示的状态文本。
   * @param type - 状态类型，决定文字颜色。
   * @returns 无返回值。
   * @example
   * feedback.showStatus("已复制到剪贴板 ✓", "success");
   */
  showStatus(message: string, type: StatusType): void {
    // 先移除隐藏态与所有颜色类，再添加新的颜色类。
    elements.status.classList.remove("hidden", ...Object.values(STATUS_COLORS));
    elements.status.classList.add(STATUS_COLORS[type]);
    elements.status.textContent = message;
  },

  /**
   * 隐藏状态信息。
   *
   * 清空文本并加回 `hidden` 类，用于切换语言等需要重置界面的场景。
   *
   * @returns 无返回值。
   * @example
   * feedback.hideStatus();
   */
  hideStatus(): void {
    elements.status.classList.add("hidden");
    elements.status.textContent = "";
  },

  /**
   * 显示预览内容。
   *
   * 用于在复制前展示最终文本，或在失败时展示错误原因。
   *
   * @param content - 要展示的预览文本。
   * @returns 无返回值。
   * @example
   * feedback.showPreview("[Example](https://example.com)");
   */
  showPreview(content: string): void {
    elements.preview.classList.remove("hidden");
    elements.preview.textContent = content;
  },

  /**
   * 隐藏预览区域并清空其中的文本。
   *
   * @returns 无返回值。
   * @example
   * feedback.hidePreview();
   */
  hidePreview(): void {
    elements.preview.classList.add("hidden");
    elements.preview.textContent = "";
  },
};

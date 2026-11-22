/**
 * 反馈展示层。
 *
 * 只负责状态提示与预览区域的显示、隐藏和样式切换，不关心业务逻辑，
 * 也不直接读写存储或标签页。
 */

import { elements } from "./elements";

/** 状态类型，对应 `STATUS_COLORS` 的键名。 */
type StatusType = keyof typeof STATUS_COLORS;

/** 状态颜色映射，用于切换 Tailwind CSS 类名。 */
const STATUS_COLORS = {
  success: "text-green-600",
  error: "text-red-500",
  warning: "text-yellow-500",
} as const;

/** 状态消息自动隐藏的定时器；连续调用时先清掉旧定时器，避免新消息被过早隐藏。 */
let statusTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * 显示状态信息时的可选配置。
 */
interface ShowStatusOptions {
  /** 是否自动隐藏，默认 `true`。 */
  autoHide?: boolean;
  /** 自动隐藏前的显示时长（毫秒），默认 3000。 */
  duration?: number;
}

/**
 * 反馈展示器，统一管理状态提示与预览区域。
 */
export const feedback = {
  /**
   * 显示状态信息。
   *
   * 未传 `options` 时默认显示 3000ms 后自动隐藏；重复调用会重置计时器，
   * 因此新消息不会被上一条的定时器提前清掉。
   *
   * @param message - 要显示的状态文本。
   * @param type - 状态类型，决定文字颜色。
   * @param options - 可选配置：传 `boolean` 表示是否自动隐藏，
   * 传对象可额外指定隐藏时长。
   * @returns 无返回值。
   * @example
   * feedback.showStatus("操作成功", "success");
   * feedback.showStatus("警告信息", "warning", false);
   * feedback.showStatus("错误信息", "error", { duration: 5000 });
   */
  showStatus(
    message: string,
    type: StatusType,
    options?: ShowStatusOptions | boolean,
  ): void {
    // 解析选项：未传时默认 3 秒后自动隐藏。
    let shouldAutoHide = true;
    let displayDuration = 3000;

    if (typeof options === "object") {
      shouldAutoHide = options.autoHide ?? true;
      displayDuration = options.duration ?? 3000;
    } else if (typeof options === "boolean") {
      shouldAutoHide = options;
    }

    // 取消上一条消息的自动隐藏，避免旧定时器把这次的新消息提前清掉。
    if (statusTimer !== undefined) {
      clearTimeout(statusTimer);
      statusTimer = undefined;
    }

    // 先移除旧样式（含 hidden 与所有颜色类），再添加新的颜色类。
    elements.status.classList.remove("hidden", ...Object.values(STATUS_COLORS));
    elements.status.classList.add(STATUS_COLORS[type]);
    elements.status.textContent = message;

    if (shouldAutoHide) {
      statusTimer = setTimeout(() => {
        feedback.hideStatus();
        statusTimer = undefined;
      }, displayDuration);
    }
  },

  /**
   * 隐藏状态信息。
   *
   * 清空文本、加回 `hidden` 类，并取消尚未执行的自动隐藏定时器。
   *
   * @returns 无返回值。
   * @example
   * feedback.hideStatus();
   */
  hideStatus(): void {
    if (statusTimer !== undefined) {
      clearTimeout(statusTimer);
      statusTimer = undefined;
    }
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

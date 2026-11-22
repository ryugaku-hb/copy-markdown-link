/**
 * DOM 操作工具模块 \
 * 提供对 Popup 页面 DOM 元素的安全访问和操作功能
 */

/** 状态类型定义，对应 `STATUS_COLORS` 的键名 */
type StatusType = keyof typeof STATUS_COLORS;

/** 状态颜色映射配置，用于 Tailwind CSS 类名切换 */
const STATUS_COLORS = {
  success: "text-green-600",
  error: "text-red-500",
  warning: "text-yellow-500",
} as const;

/** 状态消息自动隐藏的定时器；连续调用时先清掉旧定时器，避免新消息被过早隐藏 */
let statusTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * 显示状态信息的选项配置
 */
interface ShowStatusOptions {
  /** 是否自动隐藏状态消息 */
  autoHide?: boolean;
  /** 自动隐藏的持续时间（毫秒） */
  duration?: number;
}
/**
 * DOM 元素缓存管理器 \
 * 集中管理 Popup 页面中常用的 DOM 元素引用，避免重复查询 DOM
 */
export const dom = {
  // --- DOM 元素缓存 ---

  /** 链接格式选择下拉框元素 */
  formatSelect: getEl<HTMLSelectElement>("format"),
  /** 前缀输入框元素 */
  prefixInput: getEl<HTMLInputElement>("prefix"),
  /** 后缀输入框元素 */
  suffixInput: getEl<HTMLInputElement>("suffix"),
  /** 复制按钮元素 */
  copyBtn: getEl<HTMLButtonElement>("copyBtn"),
  /** 状态显示区域元素 */
  status: getEl<HTMLDivElement>("status"),
  /** 预览显示区域元素 */
  preview: getEl<HTMLDivElement>("preview"),

  // --- 状态管理方法 ---

  /**
   * 显示状态信息 \
   * 如果未传入 `options` 参数，默认行为为：**显示 3000ms 状态信息后自动隐藏**。
   * @param message - 要显示的状态信息文本
   * @param type - 状态类型，决定显示样式
   * @param options - 可选配置项，支持两种形式：
   *   1. `boolean`：是否自动隐藏状态信息
   *     - `true`：显示后自动隐藏，隐藏延迟为 3000ms
   *     - `false`：不自动隐藏
   *   2. `{ autoHide?: boolean; duration?: number }`：详细配置对象
   *     - `autoHide`：是否自动隐藏，默认为 `true`
   *     - `duration`：自动隐藏前的显示时长（毫秒），默认为 `3000`
   *
   * @example
   * dom.showStatus("操作成功", "success");
   * dom.showStatus("警告信息", "warning", false);
   * dom.showStatus("错误信息", "error", { duration: 5000 });
   */
  showStatus(
    message: string,
    type: StatusType,
    options?: ShowStatusOptions | boolean,
  ) {
    // 解析选项参数：未传 options 时默认 3 秒后自动隐藏（与上方文档一致）
    let shouldAutoHide = true;
    let displayDuration = 3000;

    if (typeof options === "object") {
      shouldAutoHide = options.autoHide ?? true;
      displayDuration = options.duration ?? 3000;
    } else if (typeof options === "boolean") {
      shouldAutoHide = options;
    }

    // 取消上一条状态消息的自动隐藏，避免旧定时器把这次的新消息提前清掉
    if (statusTimer !== undefined) {
      clearTimeout(statusTimer);
      statusTimer = undefined;
    }

    // 移除旧的样式类（包括 hidden 和所有颜色类）
    dom.status.classList.remove("hidden", ...Object.values(STATUS_COLORS));
    // 添加新的颜色类
    dom.status.classList.add(STATUS_COLORS[type]);
    dom.status.textContent = message;

    // 处理自动隐藏逻辑
    if (shouldAutoHide) {
      statusTimer = setTimeout(() => {
        dom.hideStatus();
        statusTimer = undefined;
      }, displayDuration);
    }
  },

  /**
   * 隐藏状态信息 \
   * 清除文本内容并添加 hidden 类，同时取消待执行的自动隐藏定时器
   */
  hideStatus(): void {
    if (statusTimer !== undefined) {
      clearTimeout(statusTimer);
      statusTimer = undefined;
    }
    dom.status.classList.add("hidden");
    dom.status.textContent = "";
  },

  /**
   * 显示预览内容 \
   * 自动移除 hidden 类并更新文本
   * @param content - 要显示的预览文本
   */
  showPreview(content: string): void {
    dom.preview.classList.remove("hidden");
    dom.preview.textContent = content;
  },

  /**
   * 隐藏预览内容 \
   * 添加 hidden 类并清空文本
   */
  hidePreview(): void {
    dom.preview.classList.add("hidden");
    dom.preview.textContent = "";
  },
};

/**
 * 安全获取 DOM 元素的工具函数 \
 * 封装 document.getElementById，增加空值检查和类型断言
 * @template T - 预期的 DOM 元素类型，默认为 HTMLElement
 * @param id - HTML 元素的 ID 属性值
 * @returns 类型断言后的 DOM 元素
 * @throws {Error} 当找不到对应 ID 的元素时抛出运行时错误，防止后续操作崩溃
 */
function getEl<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    const errorMessage = `[DOM Error] 找不到必要的元素: #${id}`;
    throw new Error(errorMessage);
  }

  return element as T;
}

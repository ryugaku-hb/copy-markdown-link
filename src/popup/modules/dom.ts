/** 状态颜色映射 */
const STATUS_COLORS = {
  success: "text-green-600",
  error: "text-red-500",
} as const;

/**
 * 操作 Popup 页面 DOM 元素缓存
 * - 用于快速访问常用元素
 * - 避免重复查询 DOM
 */
export const dom = {
  copyBtn: getEl<HTMLButtonElement>("copyBtn"),
  format: getEl<HTMLSelectElement>("format"),
  status: getEl<HTMLDivElement>("status"),
  preview: getEl<HTMLDivElement>("preview"),
  prefix: getEl<HTMLInputElement>("prefix"),
  suffix: getEl<HTMLInputElement>("suffix"),

  /**
   * 显示状态信息
   * @param message 状态信息文本
   * @param type 状态类型（success 或 error）
   */
  showStatus(message: string, type: keyof typeof STATUS_COLORS) {
    dom.status.classList.remove("hidden", ...Object.values(STATUS_COLORS));
    dom.status.classList.add(STATUS_COLORS[type]);
    dom.status.textContent = message;
  },

  /** 显示预览内容 */
  showPreview(content: string) {
    dom.preview.classList.remove("hidden");
    dom.preview.textContent = content;
  },
};

/** 安全获取 DOM 元素 */
function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing DOM element: #${id}`);
  return el as T;
}

/**
 * 操作 Popup 页面 DOM 元素的模块
 */
export const dom = {
  copyBtn: document.getElementById("copyBtn") as HTMLButtonElement,
  format: document.getElementById("format") as HTMLSelectElement,
  status: document.getElementById("status") as HTMLDivElement,
  preview: document.getElementById("preview") as HTMLDivElement,
  prefix: document.getElementById("prefix") as HTMLInputElement,
  suffix: document.getElementById("suffix") as HTMLInputElement,
};

/**
 * 显示状态信息
 * @param message 状态信息文本
 * @param type 状态类型（成功或错误）
 */
export function showStatus(message: string, type: "success" | "error") {
  dom.status.classList.remove("hidden", "text-green-600", "text-red-500");
  dom.status.classList.add(
    type === "success" ? "text-green-600" : "text-red-500",
  );
  dom.status.textContent = message;
}

/**
 * 显示预览内容
 * @param content 预览内容
 */
export function showPreview(content: string) {
  dom.preview.classList.remove("hidden");
  dom.preview.textContent = content;
}

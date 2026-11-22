/**
 * 剪贴板服务。
 *
 * 对 Clipboard API 做薄封装：成功时正常返回，失败时抛出错误，
 * 由调用方（ui 层）决定如何提示用户。
 */

/**
 * 将文本写入系统剪贴板。
 *
 * @param text - 要复制的文本内容。
 * @returns 写入成功后 resolve，无返回值。
 * @throws {TypeError} 参数不是字符串时抛出。
 * @throws {Error} 当前环境不支持 Clipboard API，或写入被浏览器拒绝时抛出。
 * @example
 * try {
 *   await copyText("[Example](https://example.com)");
 *   feedback.showStatus("已复制到剪贴板 ✓", "success");
 * } catch (error) {
 *   feedback.showStatus("复制失败，请重试！", "error");
 * }
 */
export async function copyText(text: string): Promise<void> {
  // 参数校验：避免把非字符串写进剪贴板后才发现问题。
  if (typeof text !== "string") {
    throw new TypeError("参数 text 必须是字符串类型");
  }

  // Clipboard API 需要安全上下文，扩展页面与 https 页面满足条件。
  if (!navigator.clipboard) {
    throw new Error("当前环境不支持 Clipboard API");
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error: unknown) {
    // 必须把失败抛出去：吞掉错误会让调用方误报“复制成功”。
    console.error("复制到剪贴板失败:", error);
    throw new Error("写入剪贴板失败，请重试");
  }
}

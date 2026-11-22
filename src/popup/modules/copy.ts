/**
 * 剪贴板操作工具模块 \
 * 封装 Clipboard API，失败时抛出错误，由调用方决定如何提示
 */

/**
 * 将文本复制到系统剪贴板
 *
 * @param text - 要复制的文本内容
 * @returns 复制成功时 resolve（无返回值）
 * @throws {Error} 剪贴板 API 不可用或写入被拒绝时抛出，调用方据此提示失败
 *
 * @example
 * ```typescript
 * try {
 *   await copyText("Hello World!");
 *   console.log("复制成功");
 * } catch (error) {
 *   console.error("复制失败:", error);
 * }
 * ```
 */
export async function copyText(text: string): Promise<void> {
  // 参数验证
  if (typeof text !== "string") {
    throw new TypeError("参数 text 必须是字符串类型");
  }

  // Clipboard API 需要安全上下文（https / 扩展页面满足条件）
  if (!navigator.clipboard) {
    throw new Error("当前环境不支持 Clipboard API");
  }

  try {
    // 写入剪贴板；弹窗失焦、权限被拒等情况会 reject
    await navigator.clipboard.writeText(text);
  } catch (error: unknown) {
    // 这里必须把失败抛出去：吞掉错误会让调用方误报"复制成功"
    console.error("复制到剪贴板失败:", error);
    throw new Error("写入剪贴板失败，请重试");
  }
}

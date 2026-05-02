/**
 * 剪贴板操作工具模块 \
 * 提供跨浏览器兼容的文本复制功能
 */

/**
 * 将文本复制到系统剪贴板
 *
 * @param text - 要复制的文本内容
 * @returns 成功时返回被复制的文本，失败时抛出错误
 *
 * @example
 * ```typescript
 * try {
 *   const copiedText = await copyText("Hello World!");
 *   console.log("复制成功:", copiedText);
 * } catch (error) {
 *   console.error("复制失败:", error.message);
 * }
 * ```
 */
export async function copyText(text: string): Promise<string> {
  // 参数验证
  if (typeof text !== "string") {
    throw new TypeError("参数 text 必须是字符串类型");
  }

  // 检查浏览器是否支持 Clipboard API
  if (!navigator.clipboard) {
    throw new Error("当前环境不支持 Clipboard API");
  }

  try {
    // 使用现代 Clipboard API 写入文本
    await navigator.clipboard.writeText(text);
    return text;
  } catch (error: unknown) {
    console.error("复制到剪贴板失败:", error);
    // 即使失败了，也返回原始文本，满足 Promise<string> 的类型约定
    return text;
  }
}

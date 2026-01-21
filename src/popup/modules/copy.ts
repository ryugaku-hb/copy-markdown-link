/**
 * 将文本复制到系统剪贴板
 * @param text 要复制的文本
 * @returns {Promise<string>} 被复制的文本
 */
export async function copyText(text: string): Promise<string> {
  if (!navigator.clipboard) {
    throw new Error("当前环境不支持 Clipboard API");
  }
  try {
    // 使用现代 Clipboard API 写入文本
    await navigator.clipboard.writeText(text);
    return text;
  } catch (err) {
    console.error("复制到剪贴板失败:", err);
    throw new Error("复制失败，请检查浏览器权限或重试");
  }
}

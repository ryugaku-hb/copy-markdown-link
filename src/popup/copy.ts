/**
 * 将文本复制到系统剪贴板
 * @param text
 * @returns {Promise<string>} 返回被复制的文本
 */
export async function copyText(text: string): Promise<string> {
  // 使用现代 Clipboard API 写入文本
  await navigator.clipboard.writeText(text);
  return text;
}

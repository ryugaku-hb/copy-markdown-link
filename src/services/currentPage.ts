/**
 * 当前页面服务 \
 * 依赖 activeTab 权限直接读取活动标签页的标题和 URL
 */

import type { LinkData } from "@/domain/linkFormat";

/**
 * 获取当前活动标签页的标题和 URL
 *
 * 用户点击扩展图标时，activeTab 权限会授予当前标签页临时的 host 权限，
 * 此时 `chrome.tabs.query` 返回的 `tab.title` / `tab.url` 对本标签页可见。
 * 因此不需要注入脚本，也就不需要 `scripting` 权限（权限面更小、少一次 IPC）。
 *
 * @returns 规整后的标题与页面 URL
 * @throws {Error} 当没有活动标签页，或页面受保护导致 URL 不可读时抛出
 */
export async function getCurrentPageInfo(): Promise<LinkData> {
  // 查询当前窗口中处于激活状态的标签页
  const [tab] = await chrome.tabs.query({
    active: true, // 标签页在它所在的窗口中是否处于激活状态
    currentWindow: true, // 标签页是否位于当前窗口
  });

  // 受保护页面（chrome://、扩展商店、PDF 查看器等）不会暴露 url，
  // activeTab 授权也不覆盖这些页面
  if (!tab?.url) {
    throw new Error("无法读取当前标签页，可能是受保护的页面");
  }

  return {
    title: normalizeTitle(tab.title, tab.url),
    url: tab.url,
  };
}

/**
 * 规整页面标题 \
 * 压缩连续空白（换行、制表符等）并去掉首尾空格；标题为空时回退到主机名
 *
 * @param rawTitle - `tab.title`，可能包含换行或为空
 * @param url - 页面 URL，用于回退生成标题
 * @returns 适合直接拼进链接的标题文本
 */
function normalizeTitle(rawTitle: string | undefined, url: string): string {
  const title = (rawTitle ?? "").replace(/\s+/g, " ").trim();
  if (title) return title;

  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

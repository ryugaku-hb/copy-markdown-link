/**
 * 标签页信息获取模块 \
 * 提供获取当前活动标签页信息的功能
 */

/**
 * 标签页信息接口
 */
interface TabInfo {
  /** 页面标题 */
  title: string;
  /** 页面 URL */
  url: string;
}

/**
 * 获取当前活动标签页的信息（标题和 URL）
 *
 * @returns 包含标题和 URL 的对象
 * @throws {Error} 当没有活动标签页、URL 不可访问或脚本注入失败时抛出
 * @example
 * try {
 *   const info = await getCurrentTabInfo();
 *   console.log(info.title);
 * } catch (err) {
 *   console.error("获取失败", err.message);
 * }
 */
export async function getCurrentTabInfo(): Promise<TabInfo> {
  // 查询当前窗口中处于激活状态的标签页
  const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({
    active: true, // 标签页在它所在的窗口中是否处于激活状态
    currentWindow: true, // 标签页是否位于当前窗口
  });

  // 获取第一个（也是唯一一个）活动标签页的 ID
  const activeTab = tabs[0];
  const tabId = activeTab?.id;

  if (!tabId) {
    throw new Error("当前没有活动的标签页");
  }

  // 检查标签页是否可以访问（例如某些特殊页面如 chrome://）
  if (!activeTab.url || activeTab.url.startsWith("chrome://")) {
    throw new Error("无法访问当前标签页的内容");
  }

  // 注入脚本以获取页面的标题和 URL
  const results: chrome.scripting.InjectionResult<TabInfo>[] =
    await chrome.scripting.executeScript({
      target: { tabId }, // 指定要注入脚本的标签页
      // 要注入并执行的 JavaScript 函数
      func: () => ({
        title: document.title,
        url: location.href,
      }),
    });

  // 处理注入脚本的结果
  const firstResult = results[0];
  if (!firstResult?.result) {
    throw new Error("脚本注入失败，无法获取标签页信息");
  }
  return firstResult.result; // 返回脚本执行后的结果
}

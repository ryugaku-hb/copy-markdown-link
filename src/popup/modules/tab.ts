/**
 * 获取当前活动标签页的信息（标题和 URL）
 *
 * @returns 包含标题和 URL 的对象
 */
export async function getCurrentTabInfo(): Promise<{
  title: string;
  url: string;
}> {
  // 获取当前窗口中处于激活状态的标签页
  const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({
    active: true, // 标签页在它所在的窗口中是否处于激活状态
    currentWindow: true, // 标签页是否位于当前窗口
  });

  const tabId = tabs[0]?.id; // tab.id 标签页的唯一标识符
  if (!tabId) throw new Error("没有活动标签页");

  // 注入脚本以获取 document.title 和 location.href
  const results: chrome.scripting.InjectionResult<{
    title: string;
    url: string;
  }>[] = await chrome.scripting.executeScript({
    target: { tabId }, // 指定要注入脚本的标签页
    func: () => ({ title: document.title, url: location.href }), // 要注入并执行的 JavaScript 函数
  });

  // 处理注入脚本的结果
  const first = results[0];
  if (!first?.result) throw new Error("脚本注入失败，无法获取标签页信息");
  return first.result; // injectionResult.result 脚本执行后的返回值
}

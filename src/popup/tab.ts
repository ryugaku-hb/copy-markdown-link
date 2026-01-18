/**
 * 获取当前活动标签页的信息（标题和 URL）
 *
 * @returns 包含标题和 URL 的对象的 Promise
 */
export function getCurrentTabInfo(): Promise<{ title: string; url: string }> {
  return (
    chrome.tabs
      // 获取当前活动标签页
      // NOTE: chrome.tabs.query(queryInfo: object,): Promise<Tab[]>
      // 获取符合指定属性的所有标签页，如果没有指定属性，则返回所有标签页。
      .query({
        active: true, // 标签页在它所在的窗口中是否处于激活状态。
        currentWindow: true, // 标签页是否位于当前窗口。
      })

      // 返回第一个标签页的 ID
      .then((tabs: chrome.tabs.Tab[]) => {
        const tabId = tabs[0]?.id; // tab.id 标签页的唯一标识符
        if (!tabId) {
          return Promise.reject(new Error("没有活动标签页"));
        }
        return tabId;
      })

      // 注入脚本以获取标签页的标题和 URL
      .then((tabId: number) =>
        // NOTE: chrome.scripting.executeScript(injection: ScriptInjection,): Promise<InjectionResult[]>
        // 向指定的目标上下文注入脚本。
        chrome.scripting.executeScript({
          target: { tabId: tabId }, // 指定要注入脚本的标签页
          func: () => ({ title: document.title, url: location.href }), // 要注入并执行的 JavaScript 函数
        }),
      )

      // 处理注入脚本的结果
      // 本例中，我们只向一个标签页注入脚本，因此结果数组中只有一个元素
      .then((results: chrome.scripting.InjectionResult[]) => {
        const first = results[0];
        if (!first || !first.result) {
          Promise.reject(new Error("脚本注入失败，无法获取标签页信息"));
        }
        return first.result; // injectionResult.result 脚本执行后的返回值
      })
  );
}

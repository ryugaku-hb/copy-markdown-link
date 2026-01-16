// 获取 popup.html 中的按钮和状态显示元素
const copyBtn = document.getElementById("copyBtn") as HTMLButtonElement;
const statusText = document.getElementById("status") as HTMLDivElement;

copyBtn.addEventListener("click", () => {
  chrome.tabs
    // 获取当前活动标签页
    // NOTE:
    // chrome.tabs.query(queryInfo: object,): Promise<Tab[]>
    // 获取符合指定属性的所有标签页，如果没有指定属性，则返回所有标签页。
    // queryInfo.active: boolean 标签页在它所在的窗口中是否处于激活状态。
    // queryInfo.currentWindow: boolean 标签页是否位于当前窗口。
    // tab.id: number 标签页的唯一标识符。
    // tab.url: string 标签页的 URL。
    // tab.title: string 标签页的标题。
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return Promise.reject("没有活动标签页");

      // 在当前标签页执行脚本，获取页面 title 和 URL
      // NOTE:
      // chrome.scripting.executeScript(injection: ScriptInjection,): Promise<InjectionResult[]>
      // 向指定的目标上下文注入脚本。
      // injection.target: InjectionTarget 指定脚本要注入到的目标对象，例如某个标签页或某个 frame。
      // injection.target.tabId: number 要注入脚本的标签页 ID。
      // injection.func: Function 要注入并执行的 JavaScript 函数。 函数形如: () => {...}
      return chrome.scripting.executeScript({
        target: { tabId: tab.id }, // 指定要注入脚本的标签页
        func: () => ({
          title: document.title, // 获取页面标题
          url: location.href, // 获取页面 URL
        }),
      });
    })
    .then((results) => {
      const { title, url } = results[0].result as {
        title: string;
        url: string;
      }; // 获取页面 title 和 url

      const markdown = `[${title}](${url})`; // 构建 Markdown 链接格式

      // 调用函数将 Markdown 文本复制到剪贴板
      return copyMarkdownLink(markdown);
    })
    .then(() => {
      // 复制成功，更新状态显示
      statusText.textContent = "已复制到剪贴板 ✓";
    })
    .catch((err) => {
      // 复制失败，更新状态显示
      statusText.textContent = "复制失败，请重试！";
      console.error("复制过程中出错", err);
    });
});

/**
 * 将文本复制到系统剪贴板
 * @param text
 * @returns
 */
function copyMarkdownLink(text: string): Promise<void> {
  // 使用现代 Clipboard API 写入文本
  return navigator.clipboard.writeText(text).catch((err) => {
    // 如果复制失败，在控制台打印错误
    console.error("复制失败", err);
    return Promise.reject(err);
  });
}

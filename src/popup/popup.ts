/**
 * Popup 入口文件。
 *
 * 只负责创建应用实例并启动，具体流程见 `ui/popupApp.ts`。
 */

import { PopupApp } from "@/popup/ui/popupApp";

try {
  const popupApp = new PopupApp();
  // init() 内部已捕获并展示错误，这里只需触发，无需 await。
  void popupApp.init();
} catch (error: unknown) {
  console.error("Popup 启动失败", error);
}

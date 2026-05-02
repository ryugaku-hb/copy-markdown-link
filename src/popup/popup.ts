/**
 * Popup 入口文件 \
 * 初始化 Popup 管理器并启动应用
 */

import { PopupManager } from "@popup/popupManager";

try {
  // 创建 Popup 管理器实例并启动
  const popupManager = new PopupManager();
  popupManager.init();
} catch (error: unknown) {
  console.error("Popup 启动失败", error);
}

/**
 * MV3 后台 Service Worker 入口。
 *
 * 当前扩展不需要后台常驻逻辑（复制流程全部在 popup 内完成），
 * 这里仅保留一个加载日志，便于在 `chrome://extensions` 的 Service Worker
 * 控制台确认脚本已被正确注册。
 */
console.log("Background service worker loaded");

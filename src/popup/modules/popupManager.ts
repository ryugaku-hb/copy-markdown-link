/**
 * Popup 管理器 \
 * 负责 Popup 页面的初始化、UI 渲染以及核心复制业务逻辑
 */

import { copyText } from "./copy";
import { dom } from "./dom";
import { isLinkFormat, linkFormats } from "./linkFormat";
import { storage } from "./storage";
import { getCurrentTabInfo } from "./tab";

export class PopupManager {
  /**
   * 构造函数 \
   * 初始化 Popup 管理器实例
   */
  constructor() {}

  /**
   * 启动 Popup 应用 \
   * 执行入口方法：负责协调 UI 初始化与事件绑定的流程
   */
  async init() {
    try {
      // 初始化界面状态（渲染下拉框、恢复用户配置）
      await this.initUI();
      // 绑定所有交互事件
      this.bindEvents();
    } catch (error: unknown) {
      // 在 UI 上显示初始化错误状态
      dom.showStatus("Popup 初始化失败", "warning");
      if (error instanceof Error) {
        dom.showPreview(error.message);
      }
    }
  }

  /**
   * 初始化用户界面 \
   * 负责构建 DOM 元素并恢复用户的持久化配置
   */
  private async initUI() {
    // 动态生成下拉框选项
    this.renderFormatOptions();
    // 从本地存储读取并回填用户之前的设置
    await this.loadSettings();
  }

  /**
   * 渲染“链接格式”下拉框的选项 \
   * 遍历 `linkFormats` 配置，动态生成 `<option>` 元素
   */
  private renderFormatOptions() {
    // 清空现有选项（防止重复初始化）
    dom.formatSelect.innerHTML = "";

    // 遍历所有可用的链接格式，创建对应的选项
    Object.entries(linkFormats).forEach(([type, format]) => {
      const option = document.createElement("option");
      option.value = type; // 设置选项的值
      option.textContent = format.label; // 设置选项的显示文本
      dom.formatSelect.appendChild(option); // 添加到下拉框中
    });
  }

  /**
   * 从存储加载并恢复用户设置 \
   * 一次读取整份设置（storage 内部只发一次 chrome.storage 请求）
   */
  private async loadSettings() {
    try {
      const settings = await storage.getSettings();

      // 批量更新 UI 状态
      dom.prefixInput.value = settings.prefix;
      dom.suffixInput.value = settings.suffix;
      dom.formatSelect.value = settings.linkFormat;
    } catch (error) {
      console.error("加载用户设置失败:", error);
    }
  }

  /**
   * 绑定所有用户交互事件 \
   * 集中管理页面上的事件监听器
   */
  private bindEvents() {
    // 监听复制按钮点击，触发主业务流程
    dom.copyBtn.addEventListener("click", () => this.handleCopy());
  }

  /**
   * 处理复制按钮点击事件 \
   * 核心业务逻辑：收集配置 -> 保存配置 -> 获取页面信息 -> 生成文本 -> 复制
   */
  private async handleCopy() {
    try {
      // 收集当前 UI 状态
      const prefix = dom.prefixInput.value;
      const suffix = dom.suffixInput.value;
      const format = dom.formatSelect.value;

      // 校验配置有效性
      if (!isLinkFormat(format)) {
        throw new Error(`无效的链接格式: ${format}`);
      }

      // 持久化保存配置 (懒保存策略：仅在点击复制时保存)
      // 一次写入三项设置，storage 内部只发一次 chrome.storage 请求
      await storage.saveSettings({ prefix, suffix, linkFormat: format });

      // 获取当前活动标签页的标题和 URL
      const { title, url } = await getCurrentTabInfo();

      // 根据选定的链接格式生成链接文本
      const baseText = linkFormats[format].generate({ title, url });
      // 拼接前缀和后缀
      const finalText = `${prefix}${baseText}${suffix}`;

      // 复制文本到剪贴板
      await copyText(finalText);

      // 显示成功状态和预览
      dom.showStatus("已复制到剪贴板 ✓", "success");
      dom.showPreview(finalText);
    } catch (error: unknown) {
      // 显示错误状态
      dom.showStatus("复制失败，请重试！", "error");
      if (error instanceof Error) {
        dom.showPreview(error.message);
      }
    }
  }
}

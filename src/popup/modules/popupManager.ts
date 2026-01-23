import { copyText } from "./copy";
import { dom } from "./dom";
import { isLinkFormat, linkFormats } from "./linkFormat";
import { storage } from "./storage";
import { getCurrentTabInfo } from "./tab";

/**
 * Popup 管理器
 * - 初始化 UI
 * - 绑定事件
 * - 处理复制逻辑
 */
export class PopupManager {
  constructor() {}

  /** 启动 Popup */
  async init() {
    try {
      await this.initUI();
      this.bindEvents();
    } catch (err) {
      console.error("Popup 初始化失败", err);
    }
  }

  /** 初始化 UI */
  private async initUI() {
    this.initFormatSelect();
    await this.restorePrefixSuffix();
    await this.restoreSelectedFormat();
  }

  /** 构建下拉框选项 */
  private initFormatSelect() {
    Object.entries(linkFormats).forEach(([type, format]) => {
      const option = document.createElement("option"); // 创建 <option> 元素
      option.value = type; // 设置 option 的 value
      option.textContent = format.label; // 设置 option 显示文本
      dom.format.appendChild(option); // 添加到下拉框中
    });
  }

  /** 从存储中恢复前缀和后缀输入框的内容 */
  private async restorePrefixSuffix() {
    try {
      const { prefix, suffix } = await storage.getPrefixSuffix();
      dom.prefix.value = prefix;
      dom.suffix.value = suffix;
    } catch (err) {
      console.error("恢复前缀后缀失败", err);
    }
  }

  /** 从存储中恢复选中的链接格式选项 */
  private async restoreSelectedFormat() {
    try {
      dom.format.value = await storage.getLinkFormat();
    } catch (err) {
      console.error("恢复选中格式失败", err);
    }
  }

  /** 绑定事件监听 */
  private bindEvents() {
    dom.format.addEventListener("change", () => this.handleFormatChange());
    dom.copyBtn.addEventListener("click", () => this.handleCopy());
  }

  /** 下拉框格式变化处理 */
  private async handleFormatChange() {
    try {
      const format = dom.format.value;
      if (!isLinkFormat(format)) throw new Error("非法的链接格式");

      await storage.setLinkFormat(format);
    } catch (err) {
      console.error("保存格式失败", err);
    }
  }

  /** 复制按钮点击处理 */
  private async handleCopy() {
    try {
      // 保存前缀后缀
      const prefix = dom.prefix.value;
      const suffix = dom.suffix.value;

      await storage.setPrefixSuffix(prefix, suffix);

      const { title, url } = await getCurrentTabInfo(); // 获取当前标签页信息

      const format = dom.format.value; // 获取用户选择的格式化器

      if (!isLinkFormat(format)) {
        throw new Error("非法的链接格式");
      }

      let text = linkFormats[format].generate({ title, url }); // 生成格式化文本
      text = `${prefix}${text}${suffix}`; // 添加前缀和后缀

      await copyText(text); // 复制到剪贴板

      // 显示状态和预览
      dom.showStatus("已复制到剪贴板 ✓", "success");
      dom.showPreview(text);
    } catch (err: any) {
      // 捕获任何错误
      dom.showStatus("复制失败，请重试！", "error");
      dom.showPreview(err.message);
    }
  }
}

/**
 * 设置表单层 \
 * 负责把设置渲染到表单、把表单内容读回为强类型对象，不直接访问 chrome API
 */

import { isLinkFormat, linkFormats } from "@/domain/linkFormat";
import type { Settings } from "@/domain/settings";
import { elements } from "./elements";

/**
 * 设置表单控制器
 */
export const settingsForm = {
  /**
   * 用格式注册表渲染"链接格式"下拉框 \
   * 直接以注册表为准，新增格式时界面自动同步
   */
  renderFormatOptions(): void {
    // 清空现有选项（防止重复初始化）
    elements.formatSelect.innerHTML = "";

    Object.entries(linkFormats).forEach(([type, format]) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = format.label;
      elements.formatSelect.appendChild(option);
    });
  },

  /**
   * 把已加载的设置回填到表单
   * @param settings - 从 storage 读出的完整设置
   */
  applySettings(settings: Settings): void {
    elements.prefixInput.value = settings.prefix;
    elements.suffixInput.value = settings.suffix;
    elements.formatSelect.value = settings.linkFormat;
  },

  /**
   * 读取表单内容并校验格式 \
   * 返回的对象可直接用于生成链接和持久化
   *
   * @returns 强类型的完整设置
   * @throws {Error} 下拉框的值不是合法格式时抛出
   */
  readSettings(): Settings {
    const format = elements.formatSelect.value;

    if (!isLinkFormat(format)) {
      throw new Error(`无效的链接格式: ${format}`);
    }

    return {
      prefix: elements.prefixInput.value,
      suffix: elements.suffixInput.value,
      linkFormat: format,
    };
  },
};

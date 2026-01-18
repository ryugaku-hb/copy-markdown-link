import { getPrefixSuffix, getLinkFormat } from "./storage";
import { dom } from "./dom";
import { linkFormats } from "./formatter";

/**
 * 初始化 Popup UI
 * 
 * - 填充下拉框选项
 * - 初始化前缀/后缀输入框
 * - 设置下拉框默认选中值
 */
export async function initUI() {
  // 动态生成下拉框选项
  // Object.entries(linkFormats) 返回一个 [key, value] 数组
  // key: 格式标识符（LinkFormatKey）
  // value: 对应的格式对象（包含 label、generate 函数等）
  Object.entries(linkFormats).forEach(([key, format]) => {
    const option = document.createElement("option"); // 创建 <option> 元素
    option.value = key; // 设置 option 的 value
    option.textContent = format.label; // 设置 option 显示文本
    dom.format.appendChild(option); // 添加到下拉框中
  });

  // 初始化前缀和后缀输入框
  const { prefix, suffix } = await getPrefixSuffix();
  dom.prefix.value = prefix;
  dom.suffix.value = suffix;

  // 设置下拉框初始值
  dom.format.value = await getLinkFormat();
}

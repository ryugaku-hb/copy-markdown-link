/**
 * DOM 元素层 \
 * 集中缓存弹窗里用到的元素引用，避免各处重复 getElementById
 */

/**
 * 安全获取 DOM 元素的工具函数 \
 * 封装 document.getElementById，增加空值检查和类型断言
 * @template T - 预期的 DOM 元素类型，默认为 HTMLElement
 * @param id - HTML 元素的 ID 属性值
 * @returns 类型断言后的 DOM 元素
 * @throws {Error} 当找不到对应 ID 的元素时抛出运行时错误，防止后续操作崩溃
 */
export function getEl<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`[DOM Error] 找不到必要的元素: #${id}`);
  }

  return element as T;
}

/**
 * 弹窗内所有需要操作的 DOM 元素 \
 * 模块加载时一次性查询并缓存，后续读写都走这份引用
 */
export const elements = {
  /** 链接格式下拉框 */
  formatSelect: getEl<HTMLSelectElement>("format"),
  /** 前缀输入框 */
  prefixInput: getEl<HTMLInputElement>("prefix"),
  /** 后缀输入框 */
  suffixInput: getEl<HTMLInputElement>("suffix"),
  /** 复制按钮 */
  copyBtn: getEl<HTMLButtonElement>("copyBtn"),
  /** 状态提示区域 */
  status: getEl<HTMLDivElement>("status"),
  /** 预览区域 */
  preview: getEl<HTMLDivElement>("preview"),
};

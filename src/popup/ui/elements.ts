/**
 * DOM 元素层。
 *
 * 集中查询并缓存弹窗里用到的元素引用，避免各处重复调用 `getElementById`，
 * 同时在元素缺失时尽早抛出明确的错误。
 */

/**
 * 安全获取 DOM 元素。
 *
 * 封装 `document.getElementById`，增加空值检查与类型断言，
 * 元素缺失时直接抛错，避免后续操作在 `null` 上崩溃。
 *
 * @template T - 期望的 DOM 元素类型，默认为 `HTMLElement`。
 * @param id - 目标元素的 `id` 属性值。
 * @returns 断言为 `T` 类型的 DOM 元素。
 * @throws {Error} 找不到对应 `id` 的元素时抛出。
 * @example
 * const btn = getEl<HTMLButtonElement>("copyBtn");
 * btn.disabled = true;
 */
export function getEl<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`[DOM Error] 找不到必要的元素: #${id}`);
  }

  return element as T;
}

/**
 * 弹窗内所有需要操作的 DOM 元素。
 *
 * 模块加载时一次性查询并缓存，后续读写都走这份引用。
 */
export const elements = {
  /** 右上角语言按钮（🌐）。 */
  localeBtn: getEl<HTMLButtonElement>("localeBtn"),
  /** 语言弹出菜单容器。 */
  localeMenu: getEl<HTMLDivElement>("localeMenu"),
  /** 链接格式下拉框。 */
  formatSelect: getEl<HTMLSelectElement>("format"),
  /** 前缀输入框。 */
  prefixInput: getEl<HTMLInputElement>("prefix"),
  /** 后缀输入框。 */
  suffixInput: getEl<HTMLInputElement>("suffix"),
  /** 复制按钮。 */
  copyBtn: getEl<HTMLButtonElement>("copyBtn"),
  /** 状态提示区域，显示成功、失败或警告信息。 */
  status: getEl<HTMLDivElement>("status"),
  /** 预览区域，显示即将复制的最终文本。 */
  preview: getEl<HTMLDivElement>("preview"),
};

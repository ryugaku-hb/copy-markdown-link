/**
 * 设置领域模块。
 *
 * 定义用户设置的数据结构与默认值，供 services 层与 ui 层共享，
 * 不包含任何读写逻辑。
 */

import { DEFAULT_LOCALE, Locale } from "./i18n";
import { DEFAULT_LINK_FORMAT, LinkFormatType } from "./linkFormat";

/**
 * 用户设置项结构，对应存储中的一份完整设置。
 */
export interface Settings {
  /** 链接前缀，会拼在最终结果之前，默认空字符串。 */
  prefix: string;
  /** 链接后缀，会拼在最终结果之后，默认空字符串。 */
  suffix: string;
  /** 链接格式，决定最终结果的样式。 */
  linkFormat: LinkFormatType;
  /** 界面语言，决定弹窗中所有文案的语言。 */
  locale: Locale;
}

/** 默认设置，同时用作 `chrome.storage.local.get` 的默认值。 */
export const DEFAULT_SETTINGS: Settings = {
  prefix: "",
  suffix: "",
  linkFormat: DEFAULT_LINK_FORMAT,
  locale: DEFAULT_LOCALE,
};

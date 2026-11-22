/**
 * 设置领域模块 \
 * 定义用户设置的结构与默认值，供 services / ui 两层共享
 */

import { DEFAULT_LINK_FORMAT, LinkFormatType } from "./linkFormat";

/**
 * 设置项结构
 */
export interface Settings {
  /** 链接前缀 */
  prefix: string;
  /** 链接后缀 */
  suffix: string;
  /** 链接格式 */
  linkFormat: LinkFormatType;
}

/** 默认设置，同时用作 `chrome.storage.local.get` 的默认值 */
export const DEFAULT_SETTINGS: Settings = {
  prefix: "",
  suffix: "",
  linkFormat: DEFAULT_LINK_FORMAT,
};

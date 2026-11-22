/**
 * 国际化（i18n）领域模块。
 *
 * 集中维护五种界面语言的文案与语言元信息，
 * 纯数据 + 查表，不依赖 DOM、chrome API，可直接单测。
 */

/**
 * 支持的界面语言。
 *
 * - `zh-CN`：简体中文（默认）；
 * - `zh-TW`：繁体中文；
 * - `en`：英语；
 * - `ja`：日语；
 * - `ko`：韩语。
 */
export type Locale = "zh-CN" | "zh-TW" | "en" | "ja" | "ko";

/**
 * 默认界面语言，首次安装或存储值非法时使用。
 */
export const DEFAULT_LOCALE: Locale = "zh-CN";

/**
 * 语言选择器中的显示名。
 *
 * 一律使用该语言自身的写法，方便用户在自己的语言里找到对应选项。
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
};

/**
 * 全部界面文案的键集合。
 *
 * 以简体中文为基准定义，`MESSAGES` 的类型为 `Record<Locale, Messages>`，
 * 因此任何语言缺键或写错键名都会在编译期报错。
 */
export interface Messages {
  /** 扩展名（标题栏与页面标题）。 */
  appName: string;
  /** 标题下方的一行说明。 */
  subtitle: string;
  /** 语言选择器的无障碍标签。 */
  languageLabel: string;
  /** “链接格式”标签。 */
  formatLabel: string;
  /** “前缀（可选）”标签。 */
  prefixLabel: string;
  /** 前缀输入框占位符。 */
  prefixPlaceholder: string;
  /** “后缀（可选）”标签。 */
  suffixLabel: string;
  /** 后缀输入框占位符。 */
  suffixPlaceholder: string;
  /** 复制按钮文案。 */
  copyButton: string;
  /** 复制成功的状态提示。 */
  statusCopied: string;
  /** 复制失败的状态提示。 */
  statusCopyFailed: string;
  /** 初始化失败的状态提示。 */
  statusInitFailed: string;
  /** 错误：受保护页面无法读取。 */
  errorProtectedPage: string;
  /** 错误：环境不支持 Clipboard API。 */
  errorClipboardUnsupported: string;
  /** 错误：写入剪贴板失败。 */
  errorClipboardWriteFailed: string;
  /** 错误：保存设置失败，`{detail}` 为原始错误信息。 */
  errorSaveSettingsFailed: string;
  /** 错误：链接格式非法，`{format}` 为无效值。 */
  errorInvalidFormat: string;
}

/**
 * 各语言的完整文案表。
 *
 * 文案中的 `{name}` 会在 `t()` 调用时被同名参数替换。
 */
const MESSAGES: Record<Locale, Messages> = {
  "zh-CN": {
    appName: "复制 Markdown 链接",
    subtitle: "一键复制当前页面的 Markdown 链接",
    languageLabel: "界面语言",
    formatLabel: "链接格式",
    prefixLabel: "前缀（可选）",
    prefixPlaceholder: "例如：★ ",
    suffixLabel: "后缀（可选）",
    suffixPlaceholder: "例如： 🔗",
    copyButton: "复制链接",
    statusCopied: "已复制到剪贴板 ✓",
    statusCopyFailed: "复制失败，请重试！",
    statusInitFailed: "初始化失败",
    errorProtectedPage: "无法读取当前标签页，可能是受保护的页面",
    errorClipboardUnsupported: "当前环境不支持 Clipboard API",
    errorClipboardWriteFailed: "写入剪贴板失败，请重试",
    errorSaveSettingsFailed: "保存设置失败：{detail}",
    errorInvalidFormat: "无效的链接格式：{format}",
  },

  "zh-TW": {
    appName: "複製 Markdown 連結",
    subtitle: "一鍵複製目前頁面的 Markdown 連結",
    languageLabel: "介面語言",
    formatLabel: "連結格式",
    prefixLabel: "前綴（選填）",
    prefixPlaceholder: "例如：★ ",
    suffixLabel: "後綴（選填）",
    suffixPlaceholder: "例如： 🔗",
    copyButton: "複製連結",
    statusCopied: "已複製到剪貼簿 ✓",
    statusCopyFailed: "複製失敗，請再試一次！",
    statusInitFailed: "初始化失敗",
    errorProtectedPage: "無法讀取目前分頁，可能是受保護的頁面",
    errorClipboardUnsupported: "目前環境不支援 Clipboard API",
    errorClipboardWriteFailed: "寫入剪貼簿失敗，請再試一次",
    errorSaveSettingsFailed: "儲存設定失敗：{detail}",
    errorInvalidFormat: "無效的連結格式：{format}",
  },

  en: {
    appName: "Copy Markdown Link",
    subtitle: "Copy the current page as a Markdown link",
    languageLabel: "Interface language",
    formatLabel: "Link format",
    prefixLabel: "Prefix (optional)",
    prefixPlaceholder: "e.g. ★ ",
    suffixLabel: "Suffix (optional)",
    suffixPlaceholder: "e.g.  🔗",
    copyButton: "Copy link",
    statusCopied: "Copied to clipboard ✓",
    statusCopyFailed: "Copy failed, please try again!",
    statusInitFailed: "Failed to initialize",
    errorProtectedPage: "Can't read this tab — it may be a protected page",
    errorClipboardUnsupported:
      "Clipboard API is not available in this environment",
    errorClipboardWriteFailed:
      "Failed to write to the clipboard, please try again",
    errorSaveSettingsFailed: "Failed to save settings: {detail}",
    errorInvalidFormat: "Invalid link format: {format}",
  },

  ja: {
    appName: "Markdown リンクをコピー",
    subtitle: "現在のページを Markdown リンクとしてコピー",
    languageLabel: "表示言語",
    formatLabel: "リンク形式",
    prefixLabel: "プレフィックス（任意）",
    prefixPlaceholder: "例：★ ",
    suffixLabel: "サフィックス（任意）",
    suffixPlaceholder: "例： 🔗",
    copyButton: "リンクをコピー",
    statusCopied: "クリップボードにコピーしました ✓",
    statusCopyFailed: "コピーに失敗しました。もう一度お試しください。",
    statusInitFailed: "初期化に失敗しました",
    errorProtectedPage:
      "このタブを読み取れません。保護されたページの可能性があります",
    errorClipboardUnsupported: "この環境では Clipboard API を利用できません",
    errorClipboardWriteFailed:
      "クリップボードへの書き込みに失敗しました。もう一度お試しください",
    errorSaveSettingsFailed: "設定の保存に失敗しました：{detail}",
    errorInvalidFormat: "無効なリンク形式です：{format}",
  },

  ko: {
    appName: "Markdown 링크 복사",
    subtitle: "현재 페이지를 Markdown 링크로 복사",
    languageLabel: "표시 언어",
    formatLabel: "링크 형식",
    prefixLabel: "접두사(선택)",
    prefixPlaceholder: "예: ★ ",
    suffixLabel: "접미사(선택)",
    suffixPlaceholder: "예:  🔗",
    copyButton: "링크 복사",
    statusCopied: "클립보드에 복사되었습니다 ✓",
    statusCopyFailed: "복사에 실패했습니다. 다시 시도해 주세요!",
    statusInitFailed: "초기화에 실패했습니다",
    errorProtectedPage: "이 탭을 읽을 수 없습니다. 보호된 페이지일 수 있습니다",
    errorClipboardUnsupported:
      "이 환경에서는 Clipboard API를 사용할 수 없습니다",
    errorClipboardWriteFailed: "클립보드에 쓰지 못했습니다. 다시 시도해 주세요",
    errorSaveSettingsFailed: "설정 저장에 실패했습니다: {detail}",
    errorInvalidFormat: "잘못된 링크 형식입니다: {format}",
  },
};

/** `Messages` 的键类型，供 `data-i18n` 等场景约束取值。 */
export type MessageKey = keyof Messages;

/**
 * 全部文案键的清单。
 *
 * 以简体中文为基准生成，可用于遍历校验各语言是否齐全，或做开发期断言。
 *
 * @example
 * MESSAGE_KEYS.every((key) => Boolean(t("ko", key))); // => true
 */
export const MESSAGE_KEYS = Object.keys(
  MESSAGES[DEFAULT_LOCALE],
) as MessageKey[];

/**
 * 判断一个值是否为受支持的界面语言。
 *
 * @param value - 待校验的值，通常来自 `chrome.storage` 或语言下拉框。
 * @returns 是合法语言标识时返回 `true`，否则返回 `false`。
 * @example
 * isLocale("ja"); // => true
 * isLocale("fr"); // => false
 */
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(LOCALE_NAMES, value)
  );
}

/**
 * 判断一个值是否为合法的文案键。
 *
 * 用于校验 HTML 上的 `data-i18n` 属性，避免拼错键名后静默显示空白。
 *
 * @param value - 待校验的值，通常来自 DOM 的 `dataset`。
 * @returns 是合法文案键时返回 `true`，否则返回 `false`。
 * @example
 * isMessageKey("copyButton"); // => true
 * isMessageKey("copyBtn"); // => false
 */
export function isMessageKey(value: unknown): value is MessageKey {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(MESSAGES[DEFAULT_LOCALE], value)
  );
}

/**
 * 取指定语言下的文案，并替换其中的 `{name}` 占位符。
 *
 * @param locale - 目标界面语言。
 * @param key - 文案键。
 * @param vars - 占位符参数，例如 `{ format: "url" }`。
 * @returns 替换完成的文案；未提供的占位符会原样保留，便于排查漏传参数。
 * @example
 * t("en", "copyButton"); // => "Copy link"
 * t("ja", "errorInvalidFormat", { format: "url" });
 * // => "無効なリンク形式です：url"
 */
export function t(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const text = MESSAGES[locale][key];

  if (!vars) return text;

  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = vars[name];
    return value === undefined ? placeholder : String(value);
  });
}

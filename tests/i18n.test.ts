import { describe, expect, it } from "vitest";

import type { Locale } from "@/domain/i18n";
import {
  DEFAULT_LOCALE,
  isLocale,
  isMessageKey,
  LOCALE_NAMES,
  MESSAGE_KEYS,
  t,
} from "@/domain/i18n";

/** 提取文案中的 `{name}` 占位符名字，排序后返回，便于逐语言比对。 */
function placeholdersOf(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

describe("语言元信息", () => {
  it("共支持 5 种语言，默认简体中文", () => {
    expect(Object.keys(LOCALE_NAMES)).toEqual([
      "zh-CN",
      "zh-TW",
      "en",
      "ja",
      "ko",
    ]);
    expect(DEFAULT_LOCALE).toBe("zh-CN");
  });

  it("每种语言的显示名都非空", () => {
    expect(Object.values(LOCALE_NAMES).every((name) => name.trim())).toBe(true);
  });
});

describe("文案表完整性", () => {
  it("共有 17 条文案键", () => {
    expect(MESSAGE_KEYS).toHaveLength(17);
  });

  it.each(Object.keys(LOCALE_NAMES))("%s 的每条文案都非空", (locale) => {
    const missing = MESSAGE_KEYS.filter((key) => {
      const text = t(locale as Locale, key);
      return typeof text !== "string" || !text.trim();
    });

    expect(missing).toEqual([]);
  });

  it.each(Object.keys(LOCALE_NAMES))("%s 的占位符与简体中文一致", (locale) => {
    const mismatched = MESSAGE_KEYS.filter((key) => {
      const base = placeholdersOf(t("zh-CN", key)).join(",");
      const target = placeholdersOf(t(locale as Locale, key)).join(",");
      return base !== target;
    });

    expect(mismatched).toEqual([]);
  });
});

describe("t()", () => {
  it("按语言返回文案", () => {
    expect(t("en", "copyButton")).toBe("Copy link");
    expect(t("ja", "appName")).toBe("Markdown リンクをコピー");
    expect(t("ko", "statusCopied")).toBe("클립보드에 복사되었습니다 ✓");
  });

  it("替换全部占位符", () => {
    expect(t("en", "errorInvalidFormat", { format: "url" })).toBe(
      "Invalid link format: url",
    );
    expect(t("ja", "errorSaveSettingsFailed", { detail: "quota" })).toBe(
      "設定の保存に失敗しました：quota",
    );
  });

  it("未提供的占位符原样保留，便于排查漏传参数", () => {
    expect(t("ko", "errorInvalidFormat")).toBe(
      "잘못된 링크 형식입니다: {format}",
    );
  });

  it("数字参数会被转成字符串", () => {
    expect(t("en", "errorInvalidFormat", { format: 42 })).toBe(
      "Invalid link format: 42",
    );
  });
});

describe("isLocale / isMessageKey", () => {
  it("识别合法语言与非法值", () => {
    expect(isLocale("zh-TW")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("toString")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });

  it("识别合法文案键与非法值", () => {
    expect(isMessageKey("copyButton")).toBe(true);
    expect(isMessageKey("copyBtn")).toBe(false);
    expect(isMessageKey("")).toBe(false);
  });
});

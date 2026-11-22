import { describe, expect, it } from "vitest";

import { AppError, localizeError } from "@/domain/errors";
import { LOCALE_NAMES } from "@/domain/i18n";

/** 全部错误码，与 `ErrorCode` 保持一致。 */
const CODES = [
  "protected_page",
  "clipboard_unsupported",
  "clipboard_write_failed",
  "save_settings_failed",
  "invalid_link_format",
] as const;

/** 需要替换 `detail` / `format` 占位符的错误码。 */
const DETAILED_CODES = ["save_settings_failed", "invalid_link_format"];

describe("AppError", () => {
  it("保留错误码、兜底文案与 detail", () => {
    const error = new AppError(
      "save_settings_failed",
      "保存设置失败：quota",
      "quota",
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AppError");
    expect(error.code).toBe("save_settings_failed");
    expect(error.detail).toBe("quota");
    expect(error.message).toBe("保存设置失败：quota");
  });
});

describe("localizeError", () => {
  const locales = Object.keys(LOCALE_NAMES) as (keyof typeof LOCALE_NAMES)[];

  it.each(CODES)("%s 在 5 种语言下都可翻译且无残留占位符", (code) => {
    for (const locale of locales) {
      const error = new AppError(
        code,
        "fallback",
        DETAILED_CODES.includes(code) ? "ARG" : undefined,
      );
      const text = localizeError(error, locale);

      expect(text.trim()).not.toBe("");
      expect(text).not.toMatch(/\{\w+\}/);
      if (DETAILED_CODES.includes(code)) {
        expect(text).toContain("ARG");
      }
    }
  });

  it("普通 Error 直接返回其 message", () => {
    expect(localizeError(new Error("raw boom"), "ja")).toBe("raw boom");
  });

  it("非 Error 值转成字符串", () => {
    expect(localizeError("plain", "en")).toBe("plain");
    expect(localizeError(42, "en")).toBe("42");
  });
});

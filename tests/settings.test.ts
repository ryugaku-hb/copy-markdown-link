import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE } from "@/domain/i18n";
import { DEFAULT_LINK_FORMAT } from "@/domain/linkFormat";
import { DEFAULT_SETTINGS } from "@/domain/settings";

describe("DEFAULT_SETTINGS", () => {
  it("默认前缀与后缀为空、格式为 markdown、语言为简体中文", () => {
    expect(DEFAULT_SETTINGS).toEqual({
      prefix: "",
      suffix: "",
      linkFormat: DEFAULT_LINK_FORMAT,
      locale: DEFAULT_LOCALE,
    });
  });

  it("各字段均为原始值，可直接写入 chrome.storage", () => {
    expect(
      Object.values(DEFAULT_SETTINGS).every((v) => typeof v === "string"),
    ).toBe(true);
  });
});

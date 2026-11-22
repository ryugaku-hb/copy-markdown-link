import { afterEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/domain/errors";
import { getCurrentPageInfo } from "@/services/currentPage";

/**
 * 用桩替代 `chrome.tabs.query`。
 *
 * @param tabs - 查询返回的标签页数组。
 */
function stubTabs(tabs: chrome.tabs.Tab[]): void {
  vi.stubGlobal("chrome", {
    tabs: { query: vi.fn(async () => tabs) },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getCurrentPageInfo", () => {
  it("返回标签页标题与 URL", async () => {
    stubTabs([
      {
        title: "Example Domain",
        url: "https://example.com/",
      } as chrome.tabs.Tab,
    ]);

    await expect(getCurrentPageInfo()).resolves.toEqual({
      title: "Example Domain",
      url: "https://example.com/",
    });
  });

  it("压缩标题中的换行与多余空格", async () => {
    stubTabs([
      {
        title: "  Hello\n\nWorld\t ",
        url: "https://example.com/",
      } as chrome.tabs.Tab,
    ]);

    await expect(getCurrentPageInfo()).resolves.toEqual({
      title: "Hello World",
      url: "https://example.com/",
    });
  });

  it("标题为空时回退到主机名", async () => {
    stubTabs([
      { title: "", url: "https://sub.example.com/a/b" } as chrome.tabs.Tab,
    ]);

    await expect(getCurrentPageInfo()).resolves.toEqual({
      title: "sub.example.com",
      url: "https://sub.example.com/a/b",
    });
  });

  it("标题为空且 URL 无法解析时直接返回原始 URL", async () => {
    stubTabs([{ title: "   ", url: "not-a-url" } as chrome.tabs.Tab]);

    await expect(getCurrentPageInfo()).resolves.toEqual({
      title: "not-a-url",
      url: "not-a-url",
    });
  });

  it("没有可读 URL（受保护页面）时抛出 protected_page", async () => {
    stubTabs([{ title: "chrome://extensions" } as chrome.tabs.Tab]);

    const error = await getCurrentPageInfo().catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("protected_page");
  });

  it("没有活动标签页时同样抛出 protected_page", async () => {
    stubTabs([]);

    await expect(getCurrentPageInfo()).rejects.toMatchObject({
      code: "protected_page",
    });
  });
});

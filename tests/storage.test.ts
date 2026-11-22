import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/domain/errors";
import { DEFAULT_SETTINGS, type Settings } from "@/domain/settings";
import { storage } from "@/services/storage";

/**
 * 用最小桩替代 `chrome.storage.local`。
 *
 * @param getImpl - 读取实现，默认返回传入的默认值。
 * @param setImpl - 写入实现，默认什么都不做。
 */
function stubStorage(
  getImpl: (
    defaults: Record<string, unknown>,
  ) => Promise<Record<string, unknown>> = async (defaults) => ({ ...defaults }),
  setImpl: (value: unknown) => Promise<void> = async () => {},
): { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> } {
  const get = vi.fn(getImpl);
  const set = vi.fn(setImpl);
  vi.stubGlobal("chrome", { storage: { local: { get, set } } });
  return { get, set };
}

beforeEach(() => {
  // 读取失败用例会走 console.error，这里屏蔽掉以保持测试输出干净。
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("storage.getSettings", () => {
  it("首次使用时返回默认设置", async () => {
    stubStorage();

    await expect(storage.getSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it("保留合法的自定义值", async () => {
    const stored: Settings = {
      prefix: "★ ",
      suffix: " 🔗",
      linkFormat: "plain",
      locale: "ko",
    };
    stubStorage(async (defaults) => ({ ...defaults, ...stored }));

    await expect(storage.getSettings()).resolves.toEqual(stored);
  });

  it("逐项校验，非法值回退到默认值", async () => {
    stubStorage(async (defaults) => ({
      ...defaults,
      prefix: 123,
      suffix: null,
      linkFormat: "url",
      locale: "fr",
    }));

    await expect(storage.getSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it("读取失败时回退为默认设置", async () => {
    stubStorage(async () => {
      throw new Error("boom");
    });

    await expect(storage.getSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it("回退的默认设置是副本，修改后不影响下一次读取", async () => {
    stubStorage(async () => {
      throw new Error("boom");
    });

    const first = await storage.getSettings();
    first.prefix = "被改坏的默认值";

    await expect(storage.getSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });
});

describe("storage.saveSettings", () => {
  it("一次性写入完整设置", async () => {
    const { set } = stubStorage();
    const settings: Settings = {
      prefix: "P",
      suffix: "S",
      linkFormat: "html",
      locale: "ja",
    };

    await storage.saveSettings(settings);

    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith(settings);
  });

  it("写入失败时抛出带错误码的 AppError，并保留原始原因", async () => {
    stubStorage(
      async (defaults) => ({ ...defaults }),
      async () => {
        throw new Error("quota exceeded");
      },
    );

    const error = await storage
      .saveSettings(DEFAULT_SETTINGS)
      .catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("save_settings_failed");
    expect((error as AppError).detail).toBe("quota exceeded");
    expect((error as AppError).message).toContain("quota exceeded");
  });
});

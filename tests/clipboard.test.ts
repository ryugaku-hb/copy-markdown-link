import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/domain/errors";
import { copyText } from "@/services/clipboard";

/**
 * 用桩替代 `navigator.clipboard`。
 *
 * @param writeText - 自定义的写入实现，传 `null` 表示环境不支持 Clipboard API。
 */
function stubClipboard(
  writeText: ((text: string) => Promise<void>) | null,
): ReturnType<typeof vi.fn> | null {
  const spy = writeText ? vi.fn(writeText) : null;
  vi.stubGlobal("navigator", spy ? { clipboard: { writeText: spy } } : {});
  return spy;
}

beforeEach(() => {
  // 写入失败用例会走 console.error，这里屏蔽掉以保持测试输出干净。
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("copyText", () => {
  it("把文本原样写入剪贴板", async () => {
    const spy = stubClipboard(async () => {});

    await copyText("[Example](https://example.com)");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("[Example](https://example.com)");
  });

  it("参数不是字符串时抛出 TypeError", async () => {
    stubClipboard(async () => {});

    await expect(copyText(123 as unknown as string)).rejects.toThrowError(
      /字符串/,
    );
  });

  it("环境不支持 Clipboard API 时抛出 clipboard_unsupported", async () => {
    stubClipboard(null);

    await expect(copyText("text")).rejects.toMatchObject({
      code: "clipboard_unsupported",
    });
  });

  it("写入被拒绝时抛出 clipboard_write_failed，而不是静默成功", async () => {
    stubClipboard(async () => {
      throw new Error("permission denied");
    });

    const error = await copyText("text").catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("clipboard_write_failed");
  });
});

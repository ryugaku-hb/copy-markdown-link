import { describe, expect, it } from "vitest";

import {
  DEFAULT_LINK_FORMAT,
  isLinkFormat,
  linkFormats,
} from "@/domain/linkFormat";

/** 常规页面信息，用于大多数格式用例。 */
const page = { title: "Example", url: "https://example.com" };

describe("linkFormats.generate", () => {
  it("markdown：输出 [title](url)", () => {
    expect(linkFormats.markdown.generate(page)).toBe(
      "[Example](https://example.com)",
    );
  });

  it("markdown：转义标题中的方括号与反斜杠", () => {
    expect(
      linkFormats.markdown.generate({ title: "a[b]c", url: page.url }),
    ).toBe("[a\\[b\\]c](https://example.com)");
    expect(
      linkFormats.markdown.generate({ title: "a\\b", url: page.url }),
    ).toBe("[a\\\\b](https://example.com)");
  });

  it("markdown：URL 含括号时用 <...> 包裹", () => {
    expect(
      linkFormats.markdown.generate({
        title: "Example",
        url: "https://example.com/a(b)c",
      }),
    ).toBe("[Example](<https://example.com/a(b)c>)");
  });

  it("markdown：URL 含空格时包裹并把尖括号编码", () => {
    expect(
      linkFormats.markdown.generate({
        title: "Example",
        url: "https://example.com/a b<c",
      }),
    ).toBe("[Example](<https://example.com/a b%3Cc>)");
  });

  it("markdownTitle：显示文本不转义引号，title 属性中的引号转义", () => {
    expect(
      linkFormats.markdownTitle.generate({
        title: 'say "hi"',
        url: page.url,
      }),
    ).toBe('[say "hi"](https://example.com "say \\"hi\\"")');
  });

  it("emptyText：显示文本为空，标题放在 title 属性", () => {
    expect(linkFormats.emptyText.generate(page)).toBe(
      '[](https://example.com "Example")',
    );
  });

  it("plain：原样返回 URL，不做任何转义", () => {
    expect(
      linkFormats.plain.generate({
        title: "Example",
        url: "https://example.com/?a=1&b=2",
      }),
    ).toBe("https://example.com/?a=1&b=2");
  });

  it("html：URL 与标题都做实体转义", () => {
    expect(
      linkFormats.html.generate({
        title: `a<b>&"'`,
        url: "https://example.com/?a=1&b=2",
      }),
    ).toBe(
      '<a href="https://example.com/?a=1&amp;b=2" title="a&lt;b&gt;&amp;&quot;&#39;">a&lt;b&gt;&amp;&quot;&#39;</a>',
    );
  });

  it("html：URL 中的尖括号被编码", () => {
    expect(
      linkFormats.html.generate({ title: "t", url: "https://e.com/<x>" }),
    ).toBe('<a href="https://e.com/&lt;x&gt;" title="t">t</a>');
  });
});

describe("isLinkFormat", () => {
  it("接受注册表中的全部格式", () => {
    const keys = Object.keys(linkFormats);
    expect(keys.every((key) => isLinkFormat(key))).toBe(true);
    expect(keys).toHaveLength(5);
  });

  it("拒绝旧版本或非法取值", () => {
    expect(isLinkFormat("url")).toBe(false);
    expect(isLinkFormat("title")).toBe(false);
    expect(isLinkFormat("")).toBe(false);
  });

  it("拒绝原型链上的键", () => {
    expect(isLinkFormat("toString")).toBe(false);
    expect(isLinkFormat("constructor")).toBe(false);
  });

  it("拒绝非字符串", () => {
    expect(isLinkFormat(1)).toBe(false);
    expect(isLinkFormat(null)).toBe(false);
    expect(isLinkFormat(undefined)).toBe(false);
  });

  it("默认格式在注册表内", () => {
    expect(isLinkFormat(DEFAULT_LINK_FORMAT)).toBe(true);
  });
});

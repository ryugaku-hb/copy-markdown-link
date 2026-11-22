# Copy Markdown Link

[![CI](https://github.com/ryugaku-hb/copy-markdown-link/actions/workflows/ci.yml/badge.svg)](https://github.com/ryugaku-hb/copy-markdown-link/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

一个 Chrome 扩展（Manifest V3）：把当前页面一键复制成 Markdown 链接，粘贴到笔记、文档、聊天窗口里即可。

## 1. 功能

- **一键复制**：点击工具栏图标，在弹窗里点「复制链接」，复制的是**当前活动标签页**的标题和 URL
- **五种链接格式**：

  | 格式                      | 复制结果                                              |
  | ------------------------- | ----------------------------------------------------- |
  | Markdown                  | `[标题](https://example.com)`                         |
  | Markdown（带 title 属性） | `[标题](https://example.com "标题")`                  |
  | 空文本链接                | `[](https://example.com "标题")`                      |
  | 纯 URL                    | `https://example.com`                                 |
  | HTML                      | `<a href="https://example.com" title="标题">标题</a>` |

- **前缀 / 后缀**：给结果加固定装饰，例如前缀 `★ `、后缀 ` 🔗`
- **五种界面语言**：简体中文（默认）、繁體中文、English、日本語、한국어。点弹窗右上角的地球图标（🌐）弹出语言菜单，选择后立即生效
- **设置本地保存**：格式、前缀、后缀、界面语言存在 `chrome.storage.local`，不上传任何数据
- **权限最小化**：只用 `activeTab` 临时读取当前标签页的标题和 URL，不申请任何全站读取权限；另需 `clipboardWrite`（写剪贴板）和 `storage`（存设置）

## 2. 环境要求

- Node.js **20.19+** 或 **22.12+**（Vite 7 的要求）
- npm（随 Node 附带）

## 3. 开发与构建

```bash
# 安装依赖
npm install

# 启动开发服务器（在浏览器里预览 popup 页面）
npm run dev

# 构建扩展，产物输出到 dist/
npm run build

# 构建并打包成可上传 Web Store 的 zip（输出到 release/）
npm run package

# 类型检查（tsc --noEmit，不产出文件）
npm run typecheck

# 运行单元测试（Vitest，跑一次）
npm test

# 测试监听模式，改代码自动重跑
npm run test:watch

# 用 Prettier 格式化整个项目
npm run format
```

| 命令                 | 作用                                                                               |
| -------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`        | Vite 开发服务器，改代码即时热更新                                                  |
| `npm run build`      | 打包到 `dist/`，同时复制 `src/public/` 下的 manifest 和图标                        |
| `npm run package`    | 构建后把 `dist/` 压成 `release/copy-markdown-link-<version>.zip`，可直接上传商店   |
| `npm run typecheck`  | 只做类型检查（含 `tests/`、`vite.config.ts`），适合提交前跑一遍                    |
| `npm test`           | Vitest 跑一次全部单元测试                                                          |
| `npm run test:watch` | Vitest 监听模式，改代码自动重跑                                                    |
| `npm run format`     | 按 `.prettierrc` + `.prettierignore` 统一格式（含 import 排序、Tailwind 类名排序） |

### 持续集成

`.github/workflows/ci.yml` 会在每次 push 和每个 PR 上依次执行：`npm ci` → `npm run typecheck` → `npm test` → `npx prettier --check .` → `npm run build`。任一步失败即为红灯，不必靠本地记得手动跑。

### 发布打包

`npm run package` 会先构建，再用 `scripts/package.mjs` 把 `dist/` 打成 `release/copy-markdown-link-<version>.zip`。压缩包内 `manifest.json` 位于根目录（Web Store 的要求），版本号取自 `package.json`。`release/` 已加入 `.gitignore`。

### 测试范围

`tests/` 覆盖了 `domain` 与 `services` 两层，浏览器能力用 `vi.stubGlobal` 打桩：

| 测试文件              | 覆盖内容                                                      |
| --------------------- | ------------------------------------------------------------- |
| `linkFormat.test.ts`  | 5 种格式输出、Markdown/HTML 转义边界、`isLinkFormat` 含原型键 |
| `i18n.test.ts`        | 5 语言文案完整性与占位符一致性、`t()` 插值、语言/文案键守卫   |
| `errors.test.ts`      | 5 个错误码 × 5 语言可翻译、无残留占位符、普通 Error 兜底      |
| `storage.test.ts`     | 默认值、逐项校验回退、读取失败兜底、写入失败抛 `AppError`     |
| `currentPage.test.ts` | 标题压缩空白、空标题回退主机名、受保护页面抛错                |
| `clipboard.test.ts`   | 写入成功/被拒、缺少 Clipboard API、非字符串参数               |
| `settings.test.ts`    | 默认设置结构与取值                                            |

UI 层（DOM 渲染、点击交互）暂未纳入自动测试，仍靠手动加载扩展验证。

> **注意**：`npm run dev` 里的页面是普通网页环境，没有 `chrome.*` API，复制功能不可用，只能用来调弹窗的样式和布局。要测真实功能，请用下面的「加载未打包扩展」方式。

## 4. 加载到 Chrome（开发模式）

1. 先构建一次：`npm run build`
2. 打开 `chrome://extensions`
3. 右上角打开 **开发者模式**
4. 点 **加载已解压的扩展程序**，选择项目下的 **`dist`** 目录（不是项目根目录）
5. 在工具栏固定扩展图标，点图标即可使用

修改代码后：重新 `npm run build`，然后在扩展卡片上点 **刷新**（↻），再重新打开弹窗。

## 5. 目录结构

```
copy-markdown-link/
├── src/
│   ├── domain/                  # 纯逻辑层：不碰 DOM / chrome API，可直接单测
│   │   ├── i18n.ts              # 五语言文案表、语言守卫与占位符插值
│   │   ├── errors.ts            # AppError 错误码与按语言翻译
│   │   ├── linkFormat.ts        # 链接格式注册表、转义规则、类型守卫
│   │   └── settings.ts          # 设置结构与默认值
│   ├── services/                # 浏览器能力层：对 chrome API 做薄封装
│   │   ├── clipboard.ts         # Clipboard API（失败抛 AppError，不吞异常）
│   │   ├── currentPage.ts       # 读取活动标签页 title / url
│   │   └── storage.ts           # chrome.storage.local 一次性读写（含语言校验）
│   ├── popup/
│   │   ├── popup.html           # 弹窗页面（静态文案用 data-i18n 标记）
│   │   ├── popup.ts             # 弹窗入口，创建并启动 PopupApp
│   │   ├── popup.css            # 引入 Tailwind
│   │   └── ui/                  # 界面层：DOM 与交互
│   │       ├── elements.ts      # 元素查询与缓存
│   │       ├── localize.ts      # 把文案表写到 data-i18n / placeholder / aria-label
│   │       ├── feedback.ts      # 状态提示 / 预览的显示与隐藏
│   │       ├── settingsForm.ts  # 语言与格式下拉框、前后缀表单的渲染与回读
│   │       └── popupApp.ts      # 启动、切换语言与复制主流程编排
│   └── public/
│       ├── manifest.json        # 扩展清单（version 由构建从 package.json 注入）
│       └── icons/               # 16 / 32 / 48 / 128 px 图标
├── tests/                       # Vitest 单元测试（domain + services）
│   ├── linkFormat.test.ts       # 格式输出与转义边界
│   ├── i18n.test.ts             # 五语言文案完整性
│   ├── errors.test.ts           # 错误码 × 语言的翻译
│   ├── storage.test.ts          # 设置读写、校验与失败兜底
│   ├── currentPage.test.ts      # 标签页信息与标题规整
│   ├── clipboard.test.ts        # 剪贴板成功/失败分支
│   └── settings.test.ts         # 默认设置
├── dist/                        # 构建产物（已 gitignore）
├── release/                     # 发布 zip（已 gitignore）
├── scripts/package.mjs          # 把 dist 打成 Web Store 可上传的 zip
├── .github/workflows/ci.yml     # 持续集成：类型检查 / 测试 / 格式 / 构建
├── vitest.config.ts             # 测试配置（node 环境 + @ 别名）
├── vite.config.ts               # 单入口（popup）、构建时注入 manifest 版本、@ 路径别名
├── tsconfig.json                # strict 模式、@/* 路径映射
└── package.json
```

分层约定：`domain` 可被任意层引用；`services` 只依赖 `domain`；`popup/ui` 依赖上面两层，并独占 DOM 操作。跨层引用统一用 `@/...`（如 `@/services/storage`），同层内用相对路径。

## 6. 界面语言

| 语言     | 代码    | 下拉框显示 |
| -------- | ------- | ---------- |
| 简体中文 | `zh-CN` | 简体中文   |
| 繁体中文 | `zh-TW` | 繁體中文   |
| 英语     | `en`    | English    |
| 日语     | `ja`    | 日本語     |
| 韩语     | `ko`    | 한국어     |

- **默认语言**：简体中文。首次安装、或存储里的值非法时都回退到 `zh-CN`
- **切换位置**：弹窗标题行右侧的地球图标（🌐）。点击后在小面板里列出五种语言（原生单选框，支持方向键切换），选中即应用并收起面板；点击面板外部或按 Esc 也会收起。图标只有 24px，且与标题同行，不会挤压副标题或主流程的布局
- **持久化**：切换语言后立即写入 `chrome.storage.local` 的 `locale` 字段，下次打开弹窗按保存值渲染；前后缀仍保持「点击复制时才保存」的懒保存策略
- **实现方式**：`domain/i18n.ts` 维护五份文案表，HTML 用 `data-i18n` / `data-i18n-placeholder` / `data-i18n-aria-label` 标记，`ui/localize.ts` 负责写回 DOM；服务层抛 `AppError` 错误码，由 `localizeError()` 按当前语言翻译，因此错误提示也会跟随语言变化
- **扩展名称与描述**（`chrome://extensions` 列表里显示的那两行）暂未本地化，那部分需要 Chrome 原生的 `_locales` 机制，与弹窗内的语言选择是两套体系

## 7. 权限说明

| 权限             | 用途                                                         |
| ---------------- | ------------------------------------------------------------ |
| `activeTab`      | 用户点击扩展时临时获得当前标签页的访问权，用于读取标题和 URL |
| `clipboardWrite` | 向系统剪贴板写入文本                                         |
| `storage`        | 保存格式、前缀、后缀与界面语言设置                           |

扩展不发起任何网络请求，也没有统计上报；所有设置只存在本机浏览器中。

## 8. 已知限制

- `chrome://`、`edge://`、`about:`、扩展商店等受保护页面无法读取内容，会提示复制失败
- 前缀 / 后缀是在点击「复制链接」时写入存储的，改完直接关闭弹窗不会保存；界面语言则是切换即保存
- 弹窗打开时会先渲染一份简体中文静态文本，脚本执行后立刻替换为已保存语言，非中文用户可能看到极短闪动

## 9. License

[MIT](./LICENSE)

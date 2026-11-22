# Copy Markdown Link

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
- **设置本地保存**：格式、前缀、后缀存在 `chrome.storage.local`，不上传任何数据
- **权限最小化**：只申请 `activeTab`，不申请全站读取权限

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

# 类型检查（tsc --noEmit，不产出文件）
npm run typecheck

# 用 Prettier 格式化整个项目
npm run format
```

| 命令                | 作用                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`       | Vite 开发服务器，改代码即时热更新                                                  |
| `npm run build`     | 打包到 `dist/`，同时复制 `src/public/` 下的 manifest 和图标                        |
| `npm run typecheck` | 只做类型检查，适合提交前跑一遍                                                     |
| `npm run format`    | 按 `.prettierrc` + `.prettierignore` 统一格式（含 import 排序、Tailwind 类名排序） |

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
│   ├── background.ts            # MV3 service worker（当前仅占位）
│   ├── domain/                  # 纯逻辑层：不碰 DOM / chrome API，可直接单测
│   │   ├── linkFormat.ts        # 链接格式注册表、转义规则、类型守卫
│   │   └── settings.ts          # 设置结构与默认值
│   ├── services/                # 浏览器能力层：对 chrome API 做薄封装
│   │   ├── clipboard.ts         # Clipboard API（失败抛错，不吞异常）
│   │   ├── currentPage.ts       # 读取活动标签页 title / url
│   │   └── storage.ts           # chrome.storage.local 一次性读写
│   ├── popup/
│   │   ├── popup.html           # 弹窗页面
│   │   ├── popup.ts             # 弹窗入口，创建并启动 PopupApp
│   │   ├── popup.css            # 引入 Tailwind
│   │   └── ui/                  # 界面层：DOM 与交互
│   │       ├── elements.ts      # 元素查询与缓存
│   │       ├── feedback.ts      # 状态提示 / 预览的显示与隐藏
│   │       ├── settingsForm.ts  # 表单渲染与回读
│   │       └── popupApp.ts      # 启动流程与复制主流程编排
│   └── public/
│       ├── manifest.json        # 扩展清单（版本号在这里）
│       └── icons/               # 16 / 32 / 48 / 128 px 图标
├── dist/                        # 构建产物（已 gitignore）
├── vite.config.ts               # 双入口（popup + background）、@ 路径别名
├── tsconfig.json                # strict 模式、@/* 路径映射
└── package.json
```

分层约定：`domain` 可被任意层引用；`services` 只依赖 `domain`；`popup/ui` 依赖上面两层，并独占 DOM 操作。跨层引用统一用 `@/...`（如 `@/services/storage`），同层内用相对路径。

## 6. 权限说明

| 权限             | 用途                                                         |
| ---------------- | ------------------------------------------------------------ |
| `activeTab`      | 用户点击扩展时临时获得当前标签页的访问权，用于读取标题和 URL |
| `clipboardWrite` | 向系统剪贴板写入文本                                         |
| `storage`        | 保存格式、前缀、后缀设置                                     |

扩展不发起任何网络请求，也没有统计上报；所有设置只存在本机浏览器中。

## 7. 已知限制

- `chrome://`、`edge://`、`about:`、扩展商店等受保护页面无法读取内容，会提示复制失败
- 版本号需要同时维护 `package.json` 和 `src/public/manifest.json`
- 设置是在点击「复制链接」时写入存储的；改完设置直接关闭弹窗不会保存

## 8. License

[MIT](./LICENSE)

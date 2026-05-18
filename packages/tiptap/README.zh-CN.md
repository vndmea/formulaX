# @formulaxjs/tiptap

[English](https://github.com/vndmea/formulaX/blob/main/packages/tiptap/README.md) | 简体中文

FormulaX 的 Tiptap 集成适配器。

`@formulaxjs/tiptap` 提供了一个 FormulaX 行内节点扩展和基于弹窗的公式编辑流程。默认情况下它在文档模型中持久化 LaTeX，并在运行时渲染 SVG；在 `output: 'image'` 模式下，还会在节点 attrs 中额外持久化上传后的 PNG 元数据。

> 状态：实验阶段。在首个稳定版本发布前，公共 API 仍可能调整。

## 功能特性

- 通过 `FormulaXNode` 导出 Tiptap 节点扩展
- 通过 `createFormulaXNode` 导出扩展工厂函数
- 提供 `openFormulaX` 命令，便于接工具栏按钮或代码中主动打开
- 支持双击编辑已有公式
- 默认在节点 attrs 中持久化 LaTeX
- 可选 `output: 'image'`，通过自定义上传函数持久化 PNG 图片元数据
- 在 node view 中运行时渲染 SVG
- 默认通过 `@formulaxjs/renderer-kity` 完成只读渲染
- 支持在首次打开弹窗前预加载 runtime
- 直接导出弹窗工具函数 `openFormulaXTiptapModal`
- 兼容 Tiptap 2 和 3 的 peer dependency 范围

## 兼容性

该包将 `@tiptap/core` 声明为可选 peer dependency：

```json
{
  "@tiptap/core": ">=2 <4"
}
```

工作空间中的 demo 可以在 Tiptap 2 和 3 之间切换，用于兼容性验证。

## 安装

包发布后可使用：

```bash
npm install @formulaxjs/tiptap @tiptap/core
```

在 FormulaX 工作空间内，直接使用 workspace 包：

```bash
pnpm install
pnpm dev:tiptap
```

## 基础使用

创建 FormulaX 节点扩展，并加入 Tiptap 的扩展列表：

```ts
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { createFormulaXNode } from '@formulaxjs/tiptap';

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [
    StarterKit,
    createFormulaXNode(undefined, {
      editor: {
        locale: 'zh_CN', // 可选，默认 en_US
      },
    }),
  ],
  content: '<p>点击工具栏按钮插入公式。</p>',
});
```

如果要在代码中主动打开 FormulaX 弹窗：

```ts
editor.commands.openFormulaX();
```

## 自定义节点名称

默认的 Tiptap 节点名是 `formulaX`。

如果宿主编辑器里已经存在同名节点，可以在创建扩展时传入自定义 `name`：

```ts
const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [
    StarterKit,
    createFormulaXNode(undefined, {
      name: 'inlineMath',
    }),
  ],
});
```

如果 Tiptap 检测到配置的节点名已经被注册，扩展会输出一条 `console.warn`，提醒你尽快改成唯一名称，避免 schema 冲突。

## 持久化数据

默认情况下，Tiptap 节点只保存 LaTeX 源内容：

```json
{
  "type": "formulaX",
  "attrs": {
    "latex": "\\sqrt{x}"
  }
}
```

节点视图会根据保存的 LaTeX 在运行时渲染 SVG。生成的 DOM 会带有 `data-formulax="true"` 和 `data-formulax-latex`，但这些渲染后的 DOM 不是持久化数据的真实来源。

启用 `output: 'image'` 后，节点 attrs 还会保存 `output`、`imageUrl`、`imageWidth`、`imageHeight`、`imageStyle`，渲染后的 DOM 会使用 `<img>`，同时继续在外层 wrapper 上保留源 LaTeX。

## PNG image output

```ts
const formulaXNode = createFormulaXNode(undefined, {
  output: 'image',
  image: {
    upload: async ({ blob, filename, latex }) => {
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('latex', latex);

      const response = await fetch('http://localhost:3109/api/formula-image/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Formula image upload failed: ${response.status}`);
      }

      const payload = await response.json() as { url?: string; location?: string };

      return {
        url: payload.url ?? payload.location ?? '',
      };
    },
  },
});
```

## 自定义 renderer

该适配器支持 `renderer` 配置项。默认值是来自 `@formulaxjs/renderer-kity` 的 `createKityFormulaRenderer()`。

```ts
import { createFormulaXNode } from '@formulaxjs/tiptap';
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

const formulaXNode = createFormulaXNode(undefined, {
  renderer: createKityFormulaRenderer({
    fontSize: 44,
  }),
});
```

## 配置项

```ts
interface FormulaXTiptapOptions {
  name?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
  cursorStyle?: string;
  initialLatex?: string;
  output?: 'svg' | 'image';
  image?: FormulaXImageOptions;
  renderer?: FormulaRenderer;
  preload?: FormulaXEditorPreloadMode;
  modal?: {
    title?: string;
    insertText?: string;
    updateText?: string;
    cancelText?: string;
    closeOnBackdrop?: boolean;
  };
  editor?: {
    height?: number | string;
    autofocus?: boolean;
    locale?: FormulaXLocale;
    assets?: Partial<KityEditorAssets>;
    render?: {
      fontsize?: number;
    };
  };
}
```

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `name` | `formulaX` | 用于文档 schema 的 Tiptap 节点名。 |
| `formulaClassName` | `formulax-math` | 渲染后公式节点使用的 CSS class。 |
| `formulaAttributeName` | `data-formulax-latex` | 渲染后 DOM 中保存 LaTeX 源内容的属性名。 |
| `cursorStyle` | `pointer` | 渲染后公式节点的鼠标光标样式。 |
| `initialLatex` | 空字符串 | 插入新公式时的初始 LaTeX。 |
| `output` | `svg` | 公式持久化为运行时 SVG 元数据，或上传后的 PNG 元数据。 |
| `image` | `undefined` | 当 `output` 为 `image` 时使用的 PNG 上传配置。 |
| `renderer` | `createKityFormulaRenderer()` | node view 中用于只读公式输出的 renderer。 |
| `preload` | `idle` | 控制在浏览器空闲时、宿主 hover/focus 时，或完全不预加载 FormulaX runtime。 |
| `modal` | 见下方 | 弹窗文案和关闭行为。 |
| `editor` | 见下方 | 内嵌 FormulaX 编辑器配置。 |

### Modal 配置

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `title` | `FormulaX Editor` | 弹窗标题。 |
| `insertText` | `Insert` | 插入公式时的提交按钮文本。 |
| `updateText` | `Update` | 更新公式时的提交按钮文本。 |
| `cancelText` | `Cancel` | 取消按钮文本。 |
| `closeOnBackdrop` | `true` | 点击遮罩层时是否关闭弹窗。 |

### Editor 配置

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `height` | `100%` | 内嵌编辑器高度。 |
| `autofocus` | `true` | 内嵌编辑器是否自动聚焦。 |
| `locale` | `en_US` | 同时切换弹窗默认文案和内嵌 Kity runtime UI。 |
| `assets` | `{}` | 可选的 Kity runtime 资源覆盖配置。 |
| `render.fontsize` | `40` | 公式渲染字号。 |

## 导出 API

| 导出 | 说明 |
| --- | --- |
| `FormulaXNode` | 默认的 FormulaX Tiptap 节点扩展。 |
| `createFormulaXNode` | 创建 FormulaX 节点扩展，可传入自定义配置。 |
| `resolveOptions` | 将用户配置与默认配置合并为完整配置。 |
| `openFormulaXTiptapModal` | 直接打开 FormulaX 弹窗。 |
| `FORMULAX_NODE_NAME` | 默认的 Tiptap 节点名。 |
| `createFormulaXPayload` | 将 LaTeX 解析为 FormulaX 文档。 |
| `serializeFormulaXPayload` | 将 FormulaX 文档序列化回 LaTeX。 |

## 开发

在仓库根目录执行：

```bash
pnpm install
pnpm dev:tiptap
```

仅构建该包：

```bash
pnpm --filter @formulaxjs/tiptap build
```

运行该包测试：

```bash
pnpm --filter @formulaxjs/tiptap test
```

运行该包类型检查：

```bash
pnpm --filter @formulaxjs/tiptap typecheck
```

## Demo

本地 demo：

```bash
pnpm dev:tiptap
```

GitHub Pages demo：

[https://vndmea.github.io/formulaX/tiptap/](https://vndmea.github.io/formulaX/tiptap/)

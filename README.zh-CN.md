# FormulaX

[English](https://github.com/vndmea/formulaX/blob/main/README.md) | 简体中文

现代公式编辑器 workspace，兼容旧版 KityFormula，并支持模块化运行时加载、共享渲染协议和富文本编辑器集成。

## 什么是 FormulaX？

FormulaX 是一个现代化的公式编辑器项目。当前实现保留了从 [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor 适配而来的兼容运行时，同时逐步把核心模型、渲染协议、只读渲染和宿主编辑器适配层拆分成更清晰的 packages。

FormulaX **不是** KityFormula 官方项目。KityFormula 相关代码被视为旧版兼容后端，保存在 `@formulaxjs/kity-runtime` 中。

## 功能特性

- 基于 KityFormula 兼容运行时的公式编辑
- 面向未来渲染引擎切换的共享 renderer 协议
- 通过独立包提供的 Kity 只读 SVG 渲染
- 模块化包结构和懒加载运行时 chunk
- 支持空闲时或悬停时预加载，减少首次打开编辑器的等待
- PNG/JPG 导出按需加载
- 发布到 npm 的适配器包会把依赖的 CSS、图片和字体一并复制到 `dist`，更适合 bundler 直接消费
- Tiptap、TinyMCE、CKEditor 5 富文本集成

## Workspace 包

部分包仍处于实验阶段，尚未发布到 npm。

| 包 | 描述 |
| --- | --- |
| `@formulaxjs/core` | 核心数据模型、LaTeX 解析和纯逻辑 |
| `@formulaxjs/renderer` | 共享 renderer 协议、公式 markup、基础样式、cache helper 和 SVG 工具 |
| `@formulaxjs/renderer-kity` | 基于 Kity 的只读渲染器，将 LaTeX 转成可内联的 SVG markup |
| `@formulaxjs/editor` | 基于 runtime 的弹窗编辑 UI 辅助层 |
| `@formulaxjs/kity-runtime` | 旧版 KityFormula 兼容运行时、内置资源和低层编辑器工厂 |
| `@formulaxjs/tiptap` | Tiptap 集成适配器 |
| `@formulaxjs/tinymce` | TinyMCE 集成适配器 |
| `@formulaxjs/ckeditor5` | CKEditor 5 集成适配器 |

## 在线演示

- Demo hub: [https://vndmea.github.io/formulaX/](https://vndmea.github.io/formulaX/)
- Playground: [https://vndmea.github.io/formulaX/playground/](https://vndmea.github.io/formulaX/playground/)
- CKEditor 5 demo: [https://vndmea.github.io/formulaX/ckeditor5/](https://vndmea.github.io/formulaX/ckeditor5/)
- Tiptap demo: [https://vndmea.github.io/formulaX/tiptap/](https://vndmea.github.io/formulaX/tiptap/)
- TinyMCE demo: [https://vndmea.github.io/formulaX/tinymce/](https://vndmea.github.io/formulaX/tinymce/)
- Vue 3 + TinyMCE demo: [https://vndmea.github.io/formulaX/vue/](https://vndmea.github.io/formulaX/vue/)
- React + Tiptap v3 demo: [https://vndmea.github.io/formulaX/react/](https://vndmea.github.io/formulaX/react/)
- Svelte + CKEditor 5 demo: [https://vndmea.github.io/formulaX/svelte/](https://vndmea.github.io/formulaX/svelte/)

## 架构设计

现在的 FormulaX 已经把共享渲染能力、Kity 只读渲染和弹窗编辑 UI 分开：

```txt
FormulaX workspace
├── @formulaxjs/core（文档模型、LaTeX 解析器/序列化器）
├── @formulaxjs/renderer（renderer 协议、markup、styles、svg helpers）
├── @formulaxjs/renderer-kity（基于 Kity 的 LaTeX -> inline SVG 渲染器）
├── @formulaxjs/editor（弹窗 UI 和内嵌编辑器编排）
├── @formulaxjs/kity-runtime（旧版兼容运行时和内置静态资源）
│   ├── KityFormula 运行时（懒加载 chunk）
│   ├── Parser 运行时（懒加载 chunk）
│   ├── 字体映射、sprite 位置映射和静态资源
│   └── canvg 导出运行时（懒加载，仅在导出 PNG/JPG 时加载）
├── @formulaxjs/tiptap（Tiptap 适配器）
├── @formulaxjs/tinymce（TinyMCE 适配器）
└── @formulaxjs/ckeditor5（CKEditor 5 适配器）
```

这种划分带来的好处：

- 各适配器可以共用一套 renderer 接口
- Kity 特有的只读渲染被隔离在 `@formulaxjs/renderer-kity`
- 弹窗编辑 UI 不再混入只读渲染职责
- 未来引入 `renderer-katex` 时，无需整体重写适配器

## KityFormula 旧版兼容性

当前编辑运行时仍然基于百度 FEX 团队的 [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor 生态兼容层。

FormulaX 将这部分代码保留在独立运行时包（`@formulaxjs/kity-runtime`）中，并将其视为兼容后端，而不是长期对外架构本体。

这样做可以：

- 保留现有编辑和渲染行为
- 继续现代化打包和懒加载
- 让宿主适配器能在首次打开弹窗前预加载 runtime
- 避免宿主适配器直接依赖 Kity runtime 细节
- 为未来渲染器实现预留空间

## 快速开始

### 环境要求

- Node.js 22+
- `corepack`
- `pnpm` 9+

### 安装

```bash
corepack enable
corepack prepare pnpm@9.12.3 --activate
pnpm install
```

### 开发

运行独立 playground：

```bash
pnpm dev
```

运行编辑器集成 demo：

```bash
pnpm dev:ckeditor5
pnpm dev:react
pnpm dev:svelte
pnpm dev:tiptap
pnpm dev:tinymce
pnpm dev:vue
```

### 构建

```bash
pnpm build
```

## 使用方式

当前 API 仍处于实验阶段，在首个稳定版本发布前可能发生变化。
如需切换弹窗 UI 和旧版 runtime 文案，可传入 `locale: 'zh_CN'`；默认值为 `en_US`。

下面的示例会故意多展示一些可选参数，方便你一次性看到目前公开的配置面。

### 共享渲染器

```ts
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

const renderer = createKityFormulaRenderer({
  fontSize: 40, // 渲染器默认字号
  height: 320, // 渲染时挂载 runtime 使用的工作区高度
  assetCacheKey: 'formulax-cdn-v1', // 资源 URL 变更时可切换缓存命名空间
  assets: {
    // 可选，局部覆盖字体 / 工具栏图片 / CSS 资源地址
    styles: {
      editor: '/static/formulax/editor.css',
    },
  },
});

const { html } = await renderer.renderLatex('\\frac{a}{b}', {
  displayMode: false, // 默认行内渲染；块级场景可设为 true
  fontSize: 40, // 单次渲染时的字号覆盖
  className: 'formulax-inline', // 输出 HTML 的包裹类名
  throwOnError: false, // 遇到渲染问题时返回兜底结果，而不是直接抛错
  cache: true, // 启用渲染缓存
});
```

### 弹窗编辑 UI

```ts
import {
  ensureFormulaXModalStyles,
  mountFormulaXEditor,
} from '@formulaxjs/editor';

ensureFormulaXModalStyles(document); // 只需注入一次基础样式和弹窗样式

const mounted = mountFormulaXEditor(document.querySelector('#host') as HTMLElement, {
  initialLatex: '\\sqrt{x}', // 初始公式
  height: 320, // 编辑器主体高度
  autofocus: true, // 挂载后自动聚焦
  locale: 'zh_CN', // 可选，默认 en_US
  assets: {
    // 可选，透传给 Kity runtime 的局部资源覆盖
    styles: {
      editor: '/static/formulax/editor.css',
    },
  },
  render: {
    fontsize: 40, // 预览 HTML 使用的字号
  },
});

const latex = await mounted.getLatex();
const state = await mounted.getState();
const renderHtml = await mounted.getRenderHtml();

mounted.destroy();
```

### 低层 Kity Runtime 入口

```ts
import { FormulaXEditor } from '@formulaxjs/kity-runtime';

const editor = new FormulaXEditor({
  el: '#app', // HTMLElement 或选择器字符串
  initialLatex: '\\int_0^1 x^2 dx', // 初始内容
  height: 320, // 工作区高度
  autofocus: true, // 挂载后自动聚焦
  assets: {
    // 可选，局部资源覆盖
    styles: {
      editor: '/static/formulax/editor.css',
    },
  },
  render: {
    fontsize: 40, // 预览 / 导出字号
  },
});

await editor.execCommand('render', '\\frac{a}{b}'); // 替换当前公式内容
await editor.focus();
await editor.destroy();
```

### Core 包

```ts
import { parseLatex, serializeLatex } from '@formulaxjs/core';

const doc = parseLatex('\\frac{a}{\\sqrt{b}}');
const latex = serializeLatex(doc);
```

### Tiptap 集成

```ts
import StarterKit from '@tiptap/starter-kit';
import { Editor } from '@tiptap/core';
import { createFormulaXNode } from '@formulaxjs/tiptap';
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

const formulaNode = createFormulaXNode(undefined, {
  name: 'formulaX', // 自定义节点名，避免 schema 冲突
  formulaClassName: 'formulax-math', // 写入 DOM 的外层 class
  formulaAttributeName: 'data-formulax-latex', // DOM 上存储 LaTeX 的属性名
  cursorStyle: 'pointer', // 行内公式的鼠标样式
  initialLatex: '\\placeholder ', // 插入新公式时的默认内容
  preload: 'idle', // 'idle' | 'hover' | false
  renderer: createKityFormulaRenderer({
    fontSize: 40,
  }), // 可选，自定义渲染器
  modal: {
    title: 'FormulaX Editor',
    insertText: 'Insert',
    updateText: 'Update',
    cancelText: 'Cancel',
    closeOnBackdrop: true,
  },
  editor: {
    height: 320,
    autofocus: true,
    locale: 'zh_CN',
    assets: {},
    render: {
      fontsize: 40,
    },
  },
});

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [StarterKit, formulaNode],
  content: '<p>Click the FormulaX toolbar button to insert a formula.</p>',
});

editor.commands.openFormulaX();
```

### TinyMCE 集成

```ts
import tinymce from 'tinymce';
import 'tinymce/icons/default';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin';
import 'tinymce/skins/content/default/content';
import {
  createTinyMceFormulaMarkup,
  registerFormulaXTinyMcePlugin,
} from '@formulaxjs/tinymce';

registerFormulaXTinyMcePlugin(tinymce, {
  pluginName: 'formulax', // TinyMCE 插件名，需要和 plugins 配置一致
  buttonName: 'formulax', // 工具栏按钮名，需要和 toolbar 配置一致
  menuItemName: 'formulax', // 菜单项标识
  toolbarText: 'FormulaX',
  tooltip: 'Insert or edit formula',
  cursorStyle: 'pointer',
  formulaClassName: 'formulax-math',
  formulaAttributeName: 'data-formulax-latex',
  initialLatex: '\\sqrt{x}',
  preload: 'idle', // 'idle' | 'hover' | false
  modal: {
    title: 'FormulaX Editor',
    insertText: 'Insert',
    updateText: 'Update',
    cancelText: 'Cancel',
    width: '1100px',
    height: 'auto',
    closeOnBackdrop: true,
  },
  editor: {
    height: 320,
    autofocus: true,
    locale: 'zh_CN',
    assets: {},
    render: {
      fontsize: 40,
    },
  },
});

await tinymce.init({
  target: document.querySelector('#tiny-host'),
  plugins: 'formulax',
  toolbar: 'undo redo | formulax',
  menubar: false,
  license_key: 'gpl',
});

const html = createTinyMceFormulaMarkup('\\sqrt{x}'); // 可选：直接生成可插入的公式 HTML
```

### CKEditor 5 集成

```ts
import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
import { FormulaX } from '@formulaxjs/ckeditor5';

await ClassicEditor.create(document.querySelector('#editor')!, {
  licenseKey: 'GPL',
  plugins: [Essentials, Paragraph, FormulaX],
  toolbar: ['formulaX'], // 自定义 buttonName 时这里也要同步
  formulaX: {
    name: 'formulaX', // 自定义模型名，避免 schema 冲突
    buttonName: 'formulaX',
    toolbarText: 'FormulaX',
    tooltip: 'Insert or edit formula',
    cursorStyle: 'pointer',
    formulaClassName: 'formulax-math',
    formulaAttributeName: 'data-formulax-latex',
    preload: 'idle', // 'idle' | 'hover' | false
    modal: {
      title: 'FormulaX Editor',
      insertText: 'Insert',
      updateText: 'Update',
      cancelText: 'Cancel',
      closeOnBackdrop: true,
    },
    editor: {
      height: 320,
      autofocus: true,
      locale: 'zh_CN',
      assets: {},
      render: {
        fontsize: 40,
      },
    },
  },
});
```

### Framework Demo 参考

- `apps/vue-demo` 演示 Vue 3 + TinyMCE v7，直接消费已发布的 `@formulaxjs/tinymce`
- `apps/react-demo` 演示 React + Tiptap v3，使用 `@formulaxjs/tiptap`
- `apps/svelte-demo` 演示 Svelte + CKEditor 5，使用 `@formulaxjs/ckeditor5`

## Workspace 脚本

- `pnpm dev` - 启动独立 FormulaX playground
- `pnpm dev:ckeditor5` - 启动 CKEditor 5 demo
- `pnpm dev:react` - 启动 React + Tiptap v3 demo
- `pnpm dev:svelte` - 启动 Svelte + CKEditor 5 demo
- `pnpm dev:tiptap` - 启动 Tiptap demo
- `pnpm dev:tinymce` - 启动 TinyMCE demo
- `pnpm dev:vue` - 启动 Vue 3 + TinyMCE v7 demo
- `pnpm build` - 构建所有 packages 和演示应用
- `pnpm build:packages` - 仅构建 workspace 中的 packages
- `pnpm build:pages` - 构建 GitHub Pages demo 站点
- `pnpm changeset` - 新建 changeset，描述发版意图和版本级别
- `pnpm changeset:version` - 应用 changeset，更新版本号和 changelog
- `pnpm changeset:publish` - 发布版本化后的 npm 包
- `pnpm release` - 先构建 packages，再通过 Changesets 发布
- `pnpm lint` - 运行 ESLint
- `pnpm typecheck` - 运行 TypeScript 类型检查
- `pnpm test` - 运行 Vitest 单元测试
- `pnpm test:browser` - 运行 Playwright 浏览器测试

## 致谢 / 来源

FormulaX 包含改编自百度 FEX 团队的 [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor 生态的代码。

KityFormula 相关代码和资源保留其原始版权和许可声明。

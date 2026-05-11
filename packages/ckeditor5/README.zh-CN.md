# @formulax/ckeditor5

[English](./README.md) | 简体中文

FormulaX 的 CKEditor 5 集成适配器。

`@formulax/ckeditor5` 提供了一个 CKEditor 5 插件，会以弹窗形式打开 FormulaX 编辑器，用于在 CKEditor 5 内容中插入和更新行内公式。

> 状态：实验阶段。在首个稳定版本发布前，公共 API 仍可能调整。

## 功能特性

- 通过 `FormulaX` 导出 CKEditor 5 插件
- 基于 CKEditor 5 `componentFactory` 注册工具栏按钮
- 通过 `editor.execute('formulaX')` 在代码中主动打开
- 将公式作为行内 widget object 插入和更新
- 支持双击编辑已有公式
- 默认通过 `data-formulax-latex` 持久化 LaTeX 源内容
- 支持在编辑器数据中对公式 markup 进行 upcast 和 downcast
- 直接导出弹窗工具函数 `openFormulaXModal`

## 兼容性

该包将 CKEditor 5 声明为可选 peer dependency：

```json
{
  "ckeditor5": ">=42 <49"
}
```

当前工作空间中的 demo 使用的是 CKEditor 5 `46.1.1`。

## 安装

包发布后可使用：

```bash
pnpm add @formulax/ckeditor5
pnpm add ckeditor5
```

在 FormulaX 工作空间内，直接使用 workspace 包：

```bash
pnpm install
pnpm dev:ckeditor5
```

## 基础使用

将 `FormulaX` 加入 CKEditor 5 的插件列表，并配置对应的工具栏项：

```ts
import {
  ClassicEditor,
  Essentials,
  Paragraph,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

import { FormulaX } from '@formulax/ckeditor5';

await ClassicEditor.create(document.querySelector('#editor')!, {
  licenseKey: 'GPL',
  plugins: [
    Essentials,
    Paragraph,
    FormulaX,
  ],
  toolbar: ['formulaX'],
  formulaX: {
    toolbarText: 'FormulaX',
    tooltip: '插入或编辑公式',
    modal: {
      title: 'FormulaX 公式编辑器',
    },
    editor: {
      render: {
        fontsize: 40,
      },
    },
  },
} as any);
```

之后用户可以点击 `FormulaX` 工具栏按钮插入公式。已有公式可以通过双击更新，也可以先选中后再次执行同一个命令进行更新。

## 代码中主动打开

插件注册的命令名与 `buttonName` 保持一致。默认配置下可直接调用：

```ts
editor.execute('formulaX');
```

## 自定义按钮名称

默认的工具栏按钮名和命令名都是 `formulaX`。

如果自定义它，需要确保 CKEditor 5 的 `toolbar` 配置与自定义名称保持一致：

```ts
await ClassicEditor.create(document.querySelector('#editor')!, {
  plugins: [Essentials, Paragraph, FormulaX],
  toolbar: ['myFormulaX'],
  formulaX: {
    buttonName: 'myFormulaX',
    toolbarText: 'FormulaX',
  },
} as any);
```

代码中主动打开时，也要使用同一个自定义命令名：

```ts
editor.execute('myFormulaX');
```

## 持久化 markup

生成的公式节点默认会通过 `data-formulax="true"` 标记，并将 LaTeX 源内容保存在 `data-formulax-latex` 中：

```html
<span
  class="formulax-math"
  data-formulax="true"
  data-formulax-latex="\\sqrt{x}"
  data-latex="\\sqrt{x}"
  contenteditable="false"
  role="button"
  style="cursor: pointer"
  tabindex="0"
></span>
```

用于渲染公式的内部 HTML 结构属于实现细节，后续可能演进。业务侧应优先依赖插件能力和导出的配置项，而不是写死完整 markup 结构。

## 配置项

```ts
interface FormulaXCKEditor5Options {
  buttonName?: string;
  toolbarText?: string;
  tooltip?: string;
  cursorStyle?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
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
    assets?: Partial<KityEditorAssets>;
    render?: {
      fontsize?: number;
    };
  };
}
```

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `buttonName` | `formulaX` | CKEditor 5 的工具栏按钮名，同时也是命令名。 |
| `toolbarText` | `FormulaX` | 工具栏按钮显示文本。 |
| `tooltip` | `Insert or edit formula` | 工具栏按钮 tooltip。 |
| `cursorStyle` | `pointer` | 应用于生成公式节点的鼠标光标样式。 |
| `formulaClassName` | `formulax-math` | 生成的公式节点 CSS class。 |
| `formulaAttributeName` | `data-formulax-latex` | 用于保存 LaTeX 源内容的属性。 |
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
| `assets` | `{}` | 可选的 Kity runtime 资源覆盖配置。 |
| `render.fontsize` | `40` | 公式渲染字号。 |

## 导出 API

| 导出 | 说明 |
| --- | --- |
| `FormulaX` | CKEditor 5 插件类。 |
| `default` | 与 `FormulaX` 相同。 |
| `FormulaXCommand` | 插件内部使用的命令实现。 |
| `resolveOptions` | 将用户配置与默认配置合并为完整配置。 |
| `openFormulaXModal` | 直接打开 FormulaX 弹窗。 |
| `DEFAULT_BUTTON_NAME` | 默认的 CKEditor 5 命令名和工具栏按钮名。 |
| `DEFAULT_FORMULA_ATTRIBUTE` | 默认的 LaTeX 持久化属性名。 |
| `DEFAULT_FORMULA_CLASS` | 默认的公式节点 CSS class。 |
| `FORMULA_FLAG_ATTRIBUTE` | 用于在编辑器数据中识别 FormulaX 节点的属性。 |

## 开发

在仓库根目录执行：

```bash
pnpm install
pnpm dev:ckeditor5
```

仅构建该包：

```bash
pnpm --filter @formulax/ckeditor5 build
```

运行该包类型检查：

```bash
pnpm --filter @formulax/ckeditor5 typecheck
```

## Demo

本地 demo：

```bash
pnpm dev:ckeditor5
```

GitHub Pages demo：

[https://vndmea.github.io/formulaX/ckeditor5/](https://vndmea.github.io/formulaX/ckeditor5/)

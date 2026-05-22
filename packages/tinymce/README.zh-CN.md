# @formulaxjs/tinymce

[English](https://github.com/vndmea/formulaX/blob/main/packages/tinymce/README.md) | 简体中文

FormulaX 的 TinyMCE 集成适配器。

`@formulaxjs/tinymce` 会将 FormulaX 注册为 TinyMCE 插件，并提供基于弹窗的公式编辑体验，用于在 TinyMCE 内容中插入和更新公式。

> 状态：实验阶段。在首个稳定版本发布前，公共 API 仍可能调整。

## 功能特性

- 通过 `registerFormulaXTinyMcePlugin` 注册 TinyMCE 插件
- 支持 FormulaX 工具栏按钮和菜单项
- 内置默认 SVG 工具栏 icon，并支持自定义 SVG 覆盖
- 在只读或不可编辑状态下，工具栏 disabled 外观交给 TinyMCE 宿主统一处理
- 提供 `FormulaXOpen` TinyMCE 命令，便于代码中主动打开公式编辑器
- 将公式作为不可直接编辑的 inline 节点插入和更新
- 支持双击、Enter、Space 编辑已有公式
- 面向 TinyMCE `>=5 <9` 的兼容层
- 通过 `data-formulax-latex` 持久化 LaTeX 源内容
- 可选 `output: 'image'`，通过自定义上传函数持久化 PNG 图片
- 提供创建、解析、序列化、查找和替换公式元素的 markup 工具函数
- 默认通过 `@formulaxjs/renderer-kity` 完成只读渲染
- 支持在首次打开弹窗前预加载 runtime

## 兼容性

该包将 TinyMCE 声明为可选 peer dependency：

```json
{
  "tinymce": ">=5 <9"
}
```

适配器设计目标为 TinyMCE 5、6、7、8。对于不支持的主版本，会输出 console warning。

工作空间中的 demo 可以通过 CDN 动态加载 TinyMCE 5、6、7、8，用于兼容性验证。

## 安装

包发布后可使用：

```bash
npm install @formulaxjs/tinymce tinymce
```

在 FormulaX 工作空间内，直接使用 workspace 包：

```bash
pnpm install
pnpm dev:tinymce
```

## 基础使用

在调用 `tinymce.init` 之前注册 FormulaX TinyMCE 插件：

```ts
import tinymce from 'tinymce';
import {
  FORMULAX_DEFAULT_FORMULA_ICON_SVG,
  registerFormulaXTinyMcePlugin,
} from '@formulaxjs/tinymce';

registerFormulaXTinyMcePlugin(tinymce, {
  pluginName: 'formulax', // TinyMCE 插件名，需要和 plugins 配置一致
  buttonName: 'formulax', // 工具栏按钮名，需要和 toolbar 配置一致
  menuItemName: 'formulax', // 如果菜单里也要出现该操作，可复用这个标识
  toolbarText: 'FormulaX', // 主要用于菜单项文案
  formulaIconName: 'formulax-formula',
  formulaIcon: FORMULAX_DEFAULT_FORMULA_ICON_SVG, // 可选；不传则使用内置 icon
  tooltip: '插入或编辑公式',
  cursorStyle: 'pointer', // 应用于公式节点的鼠标样式
  formulaClassName: 'formulax-math', // 公式外层 DOM class
  formulaAttributeName: 'data-formulax-latex', // 保存源 LaTeX 的属性名
  output: 'svg', // 'svg' | 'image'
  initialLatex: '\\sqrt{x}', // 新插入公式的默认内容
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
  preload: 'idle', // 'idle' | 'hover' | false
  modal: {
    title: 'FormulaX 公式编辑器',
    insertText: 'Insert',
    updateText: 'Update',
    cancelText: 'Cancel',
    width: '1100px',
    height: 'auto',
    closeOnBackdrop: true,
  },
  editor: {
    // 这些配置会透传给内嵌的 FormulaX 编辑器
    locale: 'zh_CN', // 可选，默认 en_US
    height: 320,
    autofocus: true,
    assets: {},
    render: { fontsize: 40 },
  },
});

await tinymce.init({
  selector: '#editor',
  height: 420,
  menubar: false,
  plugins: 'formulax',
  toolbar: 'undo redo | formulax',
  license_key: 'gpl',
});
```

之后用户可以点击 `FormulaX` 工具栏按钮插入公式。已有公式可以通过双击编辑，也可以选中后按 Enter 或 Space 编辑。

TinyMCE 工具栏按钮会以纯 icon 形式渲染。`toolbarText` 主要用于菜单项文案，工具栏按钮本身依赖 `tooltip` 和注册的 SVG icon。

如果不传 `formulaIcon`，适配器会自动用 `formulax-formula` 这个名称注册内置的 FormulaX SVG icon。

当宿主编辑器进入只读或不可编辑状态时，FormulaX 按钮和菜单项的 disabled 样式会交给 TinyMCE 宿主处理，从而与原生工具栏控件保持一致。

## PNG image output

如果希望把公式持久化成上传后的 PNG 图片，而不是 inline SVG，可以设置 `output: 'image'` 并提供 `image.upload`：

```ts
registerFormulaXTinyMcePlugin(tinymce, {
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

外层公式 wrapper 仍然会保留 `data-formulax-latex`，所以双击再次编辑的流程不需要改变。

## 代码中主动打开

插件会注册 `FormulaXOpen` 命令：

```ts
editor.execCommand('FormulaXOpen');
```

## 自定义插件名称

默认情况下，插件名、按钮名、菜单项名均为 `formulax`。

如果自定义这些名称，需要确保 TinyMCE 的 `plugins` 和 `toolbar` 配置与自定义名称保持一致：

```ts
registerFormulaXTinyMcePlugin(tinymce, {
  pluginName: 'formulaXPlugin',
  buttonName: 'formulaXButton',
  menuItemName: 'formulaXMenuItem',
});

await tinymce.init({
  selector: '#editor',
  plugins: 'formulaXPlugin',
  toolbar: 'formulaXButton',
});
```

## 公式 markup 工具函数

当需要在插件 UI 之外生成或检查 FormulaX 公式节点时，可以使用 markup 工具函数：

```ts
import {
  createTinyMceFormulaMarkup,
  getFormulaLatexFromElement,
  isFormulaElement,
  replaceFormulaElement,
} from '@formulaxjs/tinymce';

const html = createTinyMceFormulaMarkup('\\sqrt{x}');

const element = document.querySelector('[data-formulax="true"]');
if (isFormulaElement(element)) {
  const latex = getFormulaLatexFromElement(element);
  replaceFormulaElement(element, `${latex}+1`);
}
```

生成的公式节点会将 LaTeX 源内容保存在 `data-formulax-latex` 中，并通过 `data-formulax="true"` 标记：

```html
<span
  class="formulax-math"
  data-formulax="true"
  data-formulax-latex="\\sqrt{x}"
  data-latex="\\sqrt{x}"
  contenteditable="false"
  data-mce-contenteditable="false"
  style="cursor: pointer"
></span>
```

具体生成的 HTML 结构属于内部实现，后续可能演进。业务侧应优先依赖导出的工具函数。

## 自定义 renderer

该适配器支持 `renderer` 配置项。默认值是来自 `@formulaxjs/renderer-kity` 的 `createKityFormulaRenderer()`。

```ts
import tinymce from 'tinymce';
import { registerFormulaXTinyMcePlugin } from '@formulaxjs/tinymce';
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

registerFormulaXTinyMcePlugin(tinymce, {
  renderer: createKityFormulaRenderer({
    fontSize: 44,
  }),
});
```

## 配置项

```ts
interface FormulaXTinyMceOptions {
  pluginName?: string;
  buttonName?: string;
  menuItemName?: string;
  toolbarText?: string;
  formulaIcon?: string;
  formulaIconName?: string;
  tooltip?: string;
  cursorStyle?: string;
  formulaClassName?: string;
  formulaAttributeName?: string;
  output?: 'svg' | 'image';
  image?: FormulaXImageOptions;
  renderer?: FormulaRenderer;
  preload?: FormulaXEditorPreloadMode;
  initialLatex?: string;
  modal?: FormulaXModalOptions;
  editor?: Omit<FormulaXEditorOptions, 'initialLatex'>;
}
```

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `pluginName` | `formulax` | 通过 `tinymce.PluginManager.add` 注册的 TinyMCE 插件名。 |
| `buttonName` | `formulax` | 工具栏按钮名。 |
| `menuItemName` | `formulax` | 菜单项名。 |
| `toolbarText` | `FormulaX` | 菜单项文案和可读动作文本。工具栏按钮本身是纯 icon。 |
| `formulaIcon` | 内置 SVG | 注册到 TinyMCE icon registry 的工具栏 SVG 字符串。 |
| `formulaIconName` | `formulax-formula` | 传给 `editor.ui.registry.addIcon()` 的 icon 名称。 |
| `tooltip` | `Insert formula` | 工具栏按钮 tooltip。 |
| `cursorStyle` | `pointer` | 应用于生成公式节点的鼠标光标样式。 |
| `formulaClassName` | `formulax-math` | 生成的公式节点 CSS class。 |
| `formulaAttributeName` | `data-formulax-latex` | 用于保存 LaTeX 源内容的属性。 |
| `output` | `svg` | 公式持久化为 inline SVG，或上传后的 PNG 图片。 |
| `image` | `undefined` | 当 `output` 为 `image` 时使用的 PNG 上传配置。 |
| `renderer` | `createKityFormulaRenderer()` | 插件在需要运行时公式 HTML 时使用的 renderer。 |
| `preload` | `idle` | 控制在浏览器空闲时、宿主 hover/focus 时，或完全不预加载 FormulaX runtime。 |
| `initialLatex` | 空字符串 | 插入新公式时的初始 LaTeX。 |
| `modal` | 见下方 | 弹窗标题、按钮文本、尺寸和关闭行为。 |
| `editor` | 见下方 | 内嵌 FormulaX 编辑器配置。 |

### Modal 配置

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `title` | `FormulaX Editor` | 弹窗标题。 |
| `insertText` | `Insert` | 插入公式时的提交按钮文本。 |
| `updateText` | `Update` | 更新公式时的提交按钮文本。 |
| `cancelText` | `Cancel` | 取消按钮文本。 |
| `width` | `1100px` | 弹窗宽度。 |
| `height` | `auto` | 弹窗高度。 |
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
| `registerFormulaXTinyMcePlugin` | 注册 TinyMCE 插件。 |
| `resolveOptions` | 将用户配置与默认配置合并为完整配置。 |
| `openFormulaXOverlayModal` | 直接打开 FormulaX 弹窗。 |
| `FORMULAX_DEFAULT_FORMULA_ICON_SVG` | 内置 FormulaX 工具栏 SVG icon 字符串。 |
| `FORMULAX_DEFAULT_ICON_NAME` | 默认的 FormulaX icon registry 名称。 |
| `resolveFormulaXFormulaIcon` | 解析自定义或默认的 FormulaX 工具栏 SVG icon。 |
| `resolveFormulaXFormulaIconName` | 解析自定义或默认的 FormulaX icon registry 名称。 |
| `normalizeFormulaXIconSvg` | 对开发者提供的 SVG icon markup 做基础 trim。 |
| `FormulaXIconOptions` | TinyMCE 集成可复用的共享 icon 配置类型。 |
| `createTinyMceFormulaMarkup` | 根据 LaTeX 创建公式 HTML。 |
| `parseTinyMceFormulaMarkup` | 将 LaTeX 解析为 FormulaX 文档。 |
| `serializeTinyMceFormulaMarkup` | 将 FormulaX 文档序列化为 TinyMCE 公式 HTML。 |
| `getFormulaLatexFromElement` | 从公式元素读取 LaTeX 源内容。 |
| `findFormulaElement` | 查找最近的 FormulaX 公式元素。 |
| `isFormulaElement` | 判断节点是否为 FormulaX 公式元素。 |
| `replaceFormulaElement` | 使用更新后的 markup 替换已有公式元素。 |
| `getTinyMceMajorVersion` | 读取 TinyMCE 主版本号。 |
| `createTinyMceCompat` | 创建内部 TinyMCE 兼容门面。 |
| `warnUnsupportedTinyMceVersion` | 对不支持的 TinyMCE 版本输出警告。 |

## 开发

在仓库根目录执行：

```bash
pnpm install
pnpm dev:tinymce
```

仅构建该包：

```bash
pnpm --filter @formulaxjs/tinymce build
```

运行该包测试：

```bash
pnpm --filter @formulaxjs/tinymce test
```

运行该包类型检查：

```bash
pnpm --filter @formulaxjs/tinymce typecheck
```

## Demo

本地 demo：

```bash
pnpm dev:tinymce
```

GitHub Pages demo：

[https://vndmea.github.io/formulaX/tinymce/](https://vndmea.github.io/formulaX/tinymce/)

该 demo 包含 TinyMCE 版本选择器，并目标上尽量与独立 FormulaX playground 的体验保持一致。

## 注意事项与限制

- TinyMCE 5 以下以及 9 或更高版本目前不是官方支持范围。
- 当前 API 仍处于实验阶段。
- 如果宿主 TinyMCE 配置了严格的内容过滤，需要确保允许 FormulaX 公式 span 和 SVG 输出。
- 如果使用 image mode，需要保证上传接口可被当前页面访问，并正确处理跨域。
- 当前编辑 UI 使用 FormulaX 的 Kity 兼容运行时。

## 协议

FormulaX 的许可信息应在公开 npm 发布前完成审查。

KityFormula 相关代码和资源保留其原始版权和许可声明。

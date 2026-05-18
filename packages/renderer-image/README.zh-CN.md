# @formulaxjs/renderer-image

[English](https://github.com/vndmea/formulaX/blob/main/packages/renderer-image/README.md) | 简体中文

FormulaX 富文本适配器使用的 image output 辅助包。

`@formulaxjs/renderer-image` 位于 FormulaX SVG renderer 和宿主编辑器适配器之间，负责把渲染得到的 SVG markup 转成 PNG `Blob`，调用你的上传函数，并返回适合宿主持久化的图片 HTML 与元数据。

> 状态：实验阶段。在首个稳定版本发布前，公共 API 仍可能调整。

## 包定位

这个包覆盖的是 `SVG -> PNG Blob -> upload -> image renderHtml` 这条链路：

1. FormulaX renderer 先输出 inline SVG markup。
2. `svgMarkupToPngBlob` 将 SVG 栅格化为 PNG `Blob`。
3. 你的 `image.upload` 负责把 PNG 存到自己的服务端或对象存储。
4. `renderFormulaDisplayHtml` 返回 image HTML 和可持久化的元数据。

即使使用 `output: 'image'`，FormulaX 也不会丢掉源 LaTeX。各宿主适配器仍会在外层 wrapper 或编辑器 model 中保留 LaTeX，这样双击编辑和往返转换仍然成立。

## 安装

发布后可使用：

```bash
npm install @formulaxjs/renderer-image
```

在 FormulaX workspace 内：

```bash
pnpm install
pnpm --filter @formulaxjs/renderer-image build
```

## 核心 API

### `renderFormulaDisplayHtml`

给宿主适配器用的高层 helper。它会先调用 FormulaX renderer 渲染 LaTeX，再按需上传 PNG，最后返回 SVG HTML 或 image HTML。

```ts
import { renderFormulaDisplayHtml } from '@formulaxjs/renderer-image';
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

const renderer = createKityFormulaRenderer({ fontSize: 40 });

const display = await renderFormulaDisplayHtml({
  output: 'image',
  renderer,
  latex: '\\frac{a}{b}',
  className: 'formulax-math',
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

### `svgMarkupToPngBlob`

底层栅格化 helper。适合你想自己接管上传或持久化时使用。

```ts
import { svgMarkupToPngBlob } from '@formulaxjs/renderer-image';

const png = await svgMarkupToPngBlob(svgMarkup, {
  backgroundColor: '#ffffff',
});

console.log(png.width, png.height, png.displayStyle);
```

### `createFormulaImageHtml`

生成 FormulaX wrapper 内部使用的 `<img>` HTML 片段。

```ts
import { createFormulaImageHtml } from '@formulaxjs/renderer-image';

const html = createFormulaImageHtml({
  src: 'http://localhost:3109/f/48231.png',
  latex: '\\sqrt{x}',
  className: 'formulax-math',
  width: 128,
  height: 48,
  style: 'width:2.5em; height:0.94em',
});
```

### `createFormulaDisplayAttributes`

把 display result 转成外层 wrapper 需要持久化的属性，例如：

- `data-formulax-output`
- `data-formulax-image-url`
- `data-formulax-image-width`
- `data-formulax-image-height`
- `data-formulax-image-style`

宿主适配器会用这些 attrs 持久化图片元数据，同时继续保留 LaTeX。

## 本地上传 demo

workspace 里自带本地上传服务：

```bash
pnpm dev:upload
```

默认 endpoint：

```txt
http://localhost:3109/api/formula-image/upload
```

TinyMCE、Tiptap、CKEditor 5 demo 都可以切到 `image` 模式，直接指向这个 endpoint 做本地验证。

## 浏览器环境限制

这个包面向浏览器环境。PNG 生成依赖以下浏览器 API：

- `Blob`
- `fetch`
- `HTMLCanvasElement`
- `Image`
- `URL.createObjectURL`

注意事项：

- GitHub Pages 上的 demo 无法访问你本机的 `http://localhost:3109` 上传服务。
- image mode 主要用于本地开发验证、集成测试，或者你的业务侧已经提供了可访问的上传接口。
- 字体加载和最终栅格化效果仍会受到浏览器运行时与 SVG 可用字体资源的影响。

## 开发

在仓库根目录执行：

```bash
pnpm --filter @formulaxjs/renderer-image test
pnpm --filter @formulaxjs/renderer-image typecheck
```

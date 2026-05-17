# @formulaxjs/renderer

[English](https://github.com/vndmea/formulaX/blob/main/packages/renderer/README.md) | 简体中文

FormulaX 的共享 renderer 协议与公式 markup 工具集。

`@formulaxjs/renderer` 是 renderer-common 层。它不绑定 Kity、KaTeX 或任何宿主编辑器，而是提供共享类型、公式 DOM helper、基础样式、cache helper 和 SVG 后处理工具，供具体 renderer 包与编辑器 adapter 复用。

> 状态：实验阶段。在首个稳定版本发布前，公共 API 仍可能调整。

## 安装

```bash
npm install @formulaxjs/renderer
```

## 功能概览

- `FormulaRenderer`、`FormulaRenderOptions`、`FormulaRenderResult`
- `createFormulaMarkup` 与 `createFormulaElement`
- `ensureFormulaXBaseStyles`
- `createFormulaRenderCacheKey`
- `readRenderedFormulaSvgBox` 与 `serializeSvgForInsertion`

## 示例

```ts
import {
  createFormulaMarkup,
  ensureFormulaXBaseStyles,
  serializeSvgForInsertion,
} from '@formulaxjs/renderer';

ensureFormulaXBaseStyles(document);

const markup = createFormulaMarkup('\\sqrt{x}');

const svg = document.querySelector('svg');
if (svg instanceof SVGSVGElement) {
  console.log(serializeSvgForInsertion(svg));
}
```

## 包职责

当你需要面向 renderer 的共享基础能力时，请使用这个包：

- 需要稳定公式 markup helper 的宿主编辑器 adapter
- `@formulaxjs/renderer-kity` 这类具体 renderer 包
- 处理渲染后 SVG 的导出或后处理流程

如果你需要一个基于 Kity 的具体 renderer，请使用 `@formulaxjs/renderer-kity`。

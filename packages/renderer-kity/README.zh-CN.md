# @formulaxjs/renderer-kity

[English](https://github.com/vndmea/formulaX/blob/main/packages/renderer-kity/README.md) | 简体中文

FormulaX 的基于 Kity 的只读 renderer。

`@formulaxjs/renderer-kity` 通过共享的 `@formulaxjs/renderer` 协议，利用旧版 Kity runtime 将 LaTeX 转成可内联的 SVG markup。对于需要运行时 SVG 输出、但不想依赖编辑器 UI helper 的 adapter 来说，它是当前的具体 renderer 包。

> 状态：实验阶段。在首个稳定版本发布前，公共 API 仍可能调整。

## 安装

```bash
npm install @formulaxjs/renderer-kity
```

## 功能概览

- `createKityFormulaRenderer`
- `renderLatexToSvgMarkup`
- `serializeKityFormulaFromRoot`
- `waitForKityFormulaSvgLayout`
- 通过 `assetsVersion` 支持安全缓存的资源覆盖

## 示例

```ts
import { createKityFormulaRenderer } from '@formulaxjs/renderer-kity';

const renderer = createKityFormulaRenderer({
  fontSize: 40,
});

const result = await renderer.renderLatex('\\frac{a}{b}');

console.log(result.engine); // kity
console.log(result.html);   // inline SVG markup
```

如果你传入了自定义 runtime 资源覆盖，并且希望继续启用缓存，请同时传入一个 `assetsVersion` 字符串，避免不同资源集共用同一条 cache 记录。

## 包职责

当你需要今天就能直接使用的 FormulaX 具体 renderer 实现时，请使用这个包。

- 它依赖 `@formulaxjs/renderer` 提供共享 renderer 协议与 SVG helper
- 它依赖 `@formulaxjs/kity-runtime` 提供旧版 Kity 后端
- 它不依赖 `@formulaxjs/editor`

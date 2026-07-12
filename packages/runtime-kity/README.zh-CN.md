# @formulaxjs/runtime-kity

[English](https://github.com/vndmea/formulaX/blob/main/packages/runtime-kity/README.md) | 简体中文

FormulaX 的 KityFormula 兼容 runtime 适配层。

`@formulaxjs/runtime-kity` 打包了支撑 FormulaX Kity 编辑与渲染流程的 KityFormula 兼容 runtime。它同时包含 runtime 所需的字体、工具栏图片和样式资源，并提供在浏览器应用中挂载编辑器的低层 helper。

> 状态：实验阶段。在首个稳定版本发布前，公共 API 仍可能调整。

## 安装

```bash
npm install @formulaxjs/runtime-kity
```

## 功能概览

- `ensureKityRuntime`，用于懒加载 runtime 初始化
- `createKityEditor` 与 `mountKityEditor`，用于将 Kity 编辑器挂载到 DOM
- `FormulaXEditor`，对低层 runtime handle 提供更易用的 Promise 风格包装
- 面向 KityFormula 集成的兼容 runtime 能力

## 示例

```ts
import { FormulaXEditor } from '@formulaxjs/runtime-kity';

const editor = new FormulaXEditor({
  el: '#editor', // HTMLElement 或选择器字符串
  initialLatex: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}',
  height: 320, // 可选，runtime 工作区高度
  autofocus: true, // 挂载后自动聚焦
  assets: {
    // 可选，当 runtime CSS / 字体 / 工具栏图片放在 CDN 时可局部覆盖
    styles: {
      editor: '/static/formulax/editor.css',
    },
  },
  render: {
    fontsize: 40, // 预览 / 导出字号
  },
});

await editor.execCommand('render', '\\sqrt{x}');
await editor.focus();
await editor.destroy();
```

## 包职责

当你需要低层 KityFormula 编辑 runtime，或者需要兼容 KityFormula 行为时，请使用这个包。面向弹窗的编辑流程更推荐使用 `@formulaxjs/editor` 的 `mountFormulaXEditor()`；宿主编辑器集成则优先使用已经依赖该 runtime 的专用 adapter 包。

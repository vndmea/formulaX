# @formulaxjs/kity-runtime

[English](https://github.com/vndmea/formulaX/blob/main/packages/kity-runtime/README.md) | 简体中文

FormulaX 的旧版 KityFormula runtime 适配层。

`@formulaxjs/kity-runtime` 打包了支撑 FormulaX Kity 编辑与渲染流程的兼容 runtime。它同时包含 runtime 所需的旧版字体、工具栏图片和样式资源，并提供在浏览器应用中挂载编辑器的低层 helper。

> 状态：实验阶段。在首个稳定版本发布前，公共 API 仍可能调整。

## 安装

```bash
npm install @formulaxjs/kity-runtime
```

## 功能概览

- `ensureKityRuntime`，用于懒加载 runtime 初始化
- `createKityEditor` 与 `mountKityEditor`，用于将 Kity 编辑器挂载到 DOM
- 面向既有 KityFormula 集成保留的兼容性导出

## 示例

```ts
import { mountKityEditor } from '@formulaxjs/kity-runtime';

const root = document.getElementById('editor');

if (!root) {
  throw new Error('Missing #editor');
}

const handle = await mountKityEditor(root, {
  value: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}',
  locale: 'zh_CN', // 可选，默认 en_US
});

console.log(handle.getLatex());
```

## 包职责

当你需要低层旧版 Kity 编辑 runtime，或者需要兼容历史 KityFormula 行为时，请使用这个包。面向应用层的编辑器使用方式，更推荐从 `@formulaxjs/editor` 引入 `FormulaXEditor`；宿主编辑器集成则优先使用已经依赖该 runtime 的专用 adapter 包。

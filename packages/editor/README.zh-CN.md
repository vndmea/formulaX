# @formulaxjs/editor

[English](https://github.com/vndmea/formulaX/blob/main/packages/editor/README.md) | 简体中文

面向弹窗的 FormulaX 编辑器 UI 辅助层。

`@formulaxjs/editor` 提供宿主集成使用的浏览器端弹窗样式和内嵌编辑辅助逻辑。它不再承担共享 markup 层或只读 renderer 层职责。

> 状态：实验阶段。在首个稳定版本发布前，公共 API 仍可能调整。

## 安装

```bash
npm install @formulaxjs/editor
```

## 功能概览

- `ensureFormulaXModalStyles`
- `formulaXModalStyles`
- `mountFormulaXEditor`
- `preloadFormulaXEditor` 与 `scheduleFormulaXEditorPreload`
- 挂载后 editor handle 上的 `getLatex()`、`getState()`、`getRenderHtml()`

## 示例

```ts
import {
  ensureFormulaXModalStyles,
  mountFormulaXEditor,
} from '@formulaxjs/editor';

ensureFormulaXModalStyles(document);

const mounted = mountFormulaXEditor(document.querySelector('#host') as HTMLElement, {
  initialLatex: '\\sqrt{x}',
  locale: 'zh_CN', // 可选，默认 en_US
  autofocus: true,
});

const latex = await mounted.getLatex();
const html = await mounted.getRenderHtml();
```

## 预加载

如果你希望在用户打开弹窗前就开始加载 FormulaX runtime，可以使用预加载 helper：

```ts
import { scheduleFormulaXEditorPreload } from '@formulaxjs/editor';

const cleanup = scheduleFormulaXEditorPreload('hover', document.querySelector('#open-formula'));

// 如果宿主 UI 在预加载触发前被卸载，请调用 cleanup()。
```

支持的预加载模式：

- `idle`：在浏览器空闲时调度 runtime 加载
- `hover`：等待传入目标上的 `pointerenter` 或 `focusin`
- `false`：禁用预加载

## 包职责

当你需要基于弹窗的编辑流程和内嵌 FormulaX 编辑器 UI 时，请使用这个包。

- 如果需要共享 markup 或基础公式样式，请使用 `@formulaxjs/renderer`
- 如果需要基于 Kity 的只读渲染，请使用 `@formulaxjs/renderer-kity`
- 如果需要低层旧版 runtime 入口，请使用 `@formulaxjs/kity-runtime`

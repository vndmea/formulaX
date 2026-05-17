# @formulaxjs/core

[English](https://github.com/vndmea/formulaX/blob/main/packages/core/README.md) | 简体中文

FormulaX 的核心文档模型与共享工具集。

`@formulaxjs/core` 包含 AST、编辑器 state、命令辅助函数、遍历辅助函数，以及供上层 FormulaX 包使用的 LaTeX 解析与序列化逻辑。

> 状态：实验阶段。在首个稳定版本发布前，公共 API 仍可能调整。

## 安装

```bash
npm install @formulaxjs/core
```

## 功能概览

- `doc`、`group`、`frac`、`sqrt`、`supsub`、`text` 等公式 AST builder
- `createEmptyState`、`createStateFromDoc` 等 state helper
- `insertText`、`insertFraction`、`insertSuperscript`、`insertSubscript`、`insertSqrt`、`backspace` 等编辑命令
- 通过 `parseLatex` 和 `serializeLatex` 完成 LaTeX 转换

## 示例

```ts
import {
  createEmptyState,
  insertFraction,
  insertText,
  parseLatex,
  serializeLatex,
} from '@formulaxjs/core';

const initial = parseLatex('x^2+1');
const latex = serializeLatex(initial);

let state = createEmptyState();
state = insertText('x')(state);
state = insertFraction()(state);

console.log(latex);
```

## 包职责

当你需要 FormulaX 的数据结构和可确定性的纯逻辑变换，而不涉及 DOM、弹窗或宿主编辑器集成时，请使用这个包。

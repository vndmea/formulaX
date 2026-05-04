# FormulaX

[English](./README.md) | 简体中文

现代公式编辑器工作空间，兼容旧版 KityFormula，支持模块化运行时加载和可插拔渲染器。

## 什么是 FormulaX？

FormulaX 是一个现代化的公式编辑器项目。当前实现包含从 [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor 适配的兼容运行时，同时逐步将旧代码模块化以适配现代前端工具链、npm 包、懒加载和编辑器集成。

FormulaX **不是** KityFormula 的官方项目。KityFormula 相关代码作为旧版兼容层保留在 `@formulax/kity-runtime` 包中。

## 功能特性

- 基于 KityFormula 兼容运行时的公式编辑
- LaTeX 输入与渲染
- 模块化包结构，支持懒加载 chunks
- 基于 SVG 的公式渲染
- PNG/JPG 导出（按需加载 canvg runtime）
- 支持渲染器和编辑器适配器扩展
- 编辑器集成：TipTap、TinyMCE

## 工作空间包

部分包仍处于实验阶段，尚未发布到 npm。

| 包 | 描述 |
| --- | --- |
| `@formulax/kity-runtime` | FormulaX 的 KityFormula 旧版兼容运行时 |
| `@formulax/core` | FormulaX 核心数据模型和公共工具 |
| `@formulax/editor` | 现代公式编辑器基础 |
| `@formulax/renderer-katex` | 基于 KaTeX 的渲染器集成 |
| `@formulax/tiptap` | TipTap 集成适配器 |
| `@formulax/tinymce` | TinyMCE 集成适配器 |
| `@formulax/kity-assets` | KityFormula 旧版兼容静态资源 |

## 在线演示

在线演示：[https://vndmea.github.io/formulaX/playground/](https://vndmea.github.io/formulaX/playground/)

## 架构设计

FormulaX 将旧版 KityFormula 运行时隔离在 `@formulax/kity-runtime` 中。大型旧版模块逐步拆分为懒加载 chunks：

```
FormulaX 工作空间
├── @formulax/core（文档模型、LaTeX 解析器/序列化器）
├── @formulax/editor（DOM 交互、选择、键盘处理）
├── @formulax/kity-runtime（旧版兼容层）
│   ├── KityFormula 运行时（懒加载 chunk）
│   ├── Parser 运行时（懒加载 chunk）
│   ├── 字体映射和 sprite 位置映射（嵌入在懒加载 chunks 中）
│   └── canvg 导出运行时（懒加载，仅在导出 PNG/JPG 时加载）
├── @formulax/renderer-katex（KaTeX 渲染适配器）
├── @formulax/tiptap（TipTap 适配器）
└── @formulax/tinymce（TinyMCE 适配器）
```

这种架构可以实现：
- 默认入口点保持轻量，不会急切地将旧版运行时打包进来
- 仅在启用公式编辑器时懒加载旧版运行时
- 导出图片时按需加载 canvg，不影响主 bundle
- 未来可替换 KityFormula 运行时为现代渲染器

## KityFormula 旧版兼容性

当前编辑运行时基于百度 FEX 团队的 [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor 生态适配的旧版兼容层。

FormulaX 将此代码保留在独立运行时包（`@formulax/kity-runtime`）中，并将其作为**兼容后端**而非长期公共架构。

这种做法：
- 保留现有公式渲染行为
- 现代化打包和懒加载
- 为未来渲染器实现做准备
- 支持与现代编辑器和框架集成

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

运行编辑器集成演示：

```bash
pnpm dev:tiptap
pnpm dev:tinymce
```

### 构建

```bash
pnpm build
```

## 使用方式

当前 API 仍处于实验阶段，在首个稳定 npm 版本发布前可能发生变化。

### 独立 Playground

```bash
pnpm dev
```

### 浏览器 SDK（原生 JS）

```html
<script src="https://unpkg.com/@formulax/core/dist/browser/index.global.js"></script>
<script>
  const doc = FormulaX.parseLatex('\\frac{a}{b}');
  const latex = FormulaX.serializeLatex(doc);
</script>
```

### Core 包

```ts
import { parseLatex, serializeLatex } from '@formulax/core';

const doc = parseLatex('\\frac{a}{\\sqrt{b}}');
const latex = serializeLatex(doc);
```

### KaTeX 渲染器

```ts
import { parseLatex } from '@formulax/core';
import { renderKatex } from '@formulax/renderer-katex';

const doc = parseLatex('\\sqrt{x}');
const html = renderKatex(doc);
```

### TipTap 集成

```ts
import StarterKit from '@tiptap/starter-kit';
import { Editor } from '@tiptap/core';
import { FormulaXNode } from '@formulax/tiptap';

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [StarterKit, FormulaXNode],
});
```

### TinyMCE 集成

```ts
import tinymce from 'tinymce';
import { createTinyMceFormulaMarkup } from '@formulax/tinymce';

tinymce.init({
  target: document.querySelector('#tiny-host'),
});

const markup = createTinyMceFormulaMarkup('\\sqrt{x}');
```

## 工作空间脚本

- `pnpm dev` - 启动独立 FormulaX playground
- `pnpm dev:tiptap` - 启动 TipTap 演示
- `pnpm dev:tinymce` - 启动 TinyMCE 演示
- `pnpm build` - 构建所有 packages 和演示应用
- `pnpm build:packages` - 仅构建 workspace packages
- `pnpm build:pages` - 构建 GitHub Pages 演示站
- `pnpm lint` - 运行 ESLint
- `pnpm typecheck` - 运行 TypeScript 类型检查
- `pnpm test` - 运行 Vitest 单元测试
- `pnpm test:browser` - 运行 Playwright 浏览器测试

## 致谢 / 来源

FormulaX 包含改编自百度 FEX 团队的 [KityFormula](https://github.com/BaiduFE/kityformula) / kf-editor 生态的代码。

KityFormula 相关代码和资源保留其原始版权和许可声明。

原始 KityFormula 项目提供了为 `@formulax/kity-runtime` 中旧版兼容运行时提供支持的公式渲染引擎和交互模型基础。

FormulaX 中的 KityFormula 相关代码：
- 隔离在 `@formulax/kity-runtime` 作为旧版兼容层
- 不是 FormulaX 的长期架构
- 计划在未来版本中替换或大幅重构

FormulaX 与百度或原始 KityFormula 项目无关。

## 发布方向

在公开 npm 发布之前，以下方面需要进一步打磨：

- 各 package 稳定的公共 API
- 包级 changelog 和发布说明
- 类型声明输出清理和导出强化
- 浏览器兼容性矩阵
- 文档格式变更的语义化版本策略

## 设计原则

- 语义逻辑放在 `core`
- DOM 交互放在 `editor`
- 渲染适配器保持轻薄
- 宿主集成保持轻薄
- UI 可复用且可替换

## 协议

**注意**：在公开 npm 发布之前，应审查并最终确定 FormulaX 及所有第三方组件的许可信息。

KityFormula 相关代码和资源保留其原始版权和许可声明。

## 待办事项

- 添加 MathML 导入/导出支持
- 扩展 AST 支持矩阵、求和、积分和更丰富的符号库
- 改进光标移动和嵌套选择行为
- 添加 IME 友好的文本编辑行为
- 添加更丰富的命令 API 用于结构化编辑
- 改进 LaTeX 解析器的错误恢复
- 添加协作事务钩子
- 完成 Playwright 浏览器测试（需下载浏览器）
- 添加除 TipTap 和 TinyMCE 之外的框架集成文档
- 准备 npm 发布流程和使用 Changesets 的自动化发布
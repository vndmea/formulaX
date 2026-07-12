# Runtime Graph 编辑器架构设计

## 背景

当前项目同时存在两套公式编辑运行时：

- `packages/runtime-kity`
  - 基于 Kity Formula 的旧运行时
  - 具备完整的输入、选区、光标、占位符、结构插入、拖拽选择、工具栏、滚动与重选体系
- `packages/runtime`
  - 新的 runtime graph / standard
  - 当前更接近“可渲染、可做少量结构插入的最小编辑原型”

在最新代码下，新 runtime 已经具备以下能力：

- LaTeX 解析为内部文档模型
- 文档模型布局为多行 SVG
- 基础字符输入
- 基础左右上下光标移动
- 基础删除
- 分数、根式、上下标插入
- 撤销与重做
- standard toolbar 与 modal 接入

但它距离“真正可编辑的公式编辑器”还有明显差距，尤其体现在：

- 编辑链路脆弱，真实集成中容易表现为“不可编辑”
- 选区模型过弱，只支持点光标，不支持范围选择
- 很多公式结构虽然能显示，但不是以结构化语义编辑
- placeholder 体系不完整，用户无法像 Kity 一样顺畅补全结构
- 输入、光标、重选、渲染反馈、滚动定位还没有形成闭环

## 设计目标

本设计不考虑与 Kity runtime 的内部兼容，也不以迁移旧服务体系为目标。

新的 runtime 的本质目标只有一件事：

> 做一个围绕 LaTeX 编辑而设计的、结构化、可持续扩展、交互友好的新公式编辑运行时。

核心目标：

1. 能解析 LaTeX 为结构化 AST
2. 能对 AST 进行结构化编辑
3. 能稳定序列化回 LaTeX
4. 能提供友好的交互体验，尤其是基于 placeholder 的结构补全体验

## 核心设计原则

### 1. 单一状态源

编辑器中每一类核心状态只能有一个正式来源，不能在多个模块内各自维护并尝试同步。

必须坚持：

- 文档状态只有一份正式 AST
- selection 状态只有一份正式表示
- placeholder 状态只有一份正式表示
- history 状态只有一份正式来源

禁止出现：

- `core` 有一套 selection，`runtime` 再派生一套可编辑 selection 并长期保存
- `editor` 层再定义一套 toolbar placeholder 状态
- DOM 上的状态成为事实来源，而 AST 反而只是镜像

### 2. 相同逻辑只实现一次

凡是本质相同的逻辑，必须收敛到单一模块，不允许在不同包内复制。

优先级如下：

- 公式语义逻辑放在 `packages/core`
- 命中测试与视图交互逻辑放在 `packages/runtime`
- modal / toolbar / host editor 适配逻辑放在 `packages/editor`

例如：

- parser 不能在 `runtime` 和 `editor` 各写一份
- placeholder 导航规则不能在 toolbar 插入后手写一遍、在 editor 输入时再写一遍
- 命令语义不能在 `editor` 层拼一套，在 `core` 层再实现一套

### 3. UI 不拥有编辑语义

`packages/editor` 只负责壳层和交互入口，不拥有公式编辑语义本身。

因此：

- toolbar 不定义独立状态机
- modal 不定义独立 selection
- editor host 不定义独立 placeholder 逻辑

UI 层只能：

- 发出 command
- 订阅 editor state
- 渲染 state 映射结果

### 4. 先抽象复用，再扩展能力

后续新增功能时，优先检查是否可以复用已有：

- AST 节点
- transaction 机制
- selection 模型
- placeholder 状态机
- hit-test 结果
- command pipeline

如果某个新功能需要复制已有逻辑才能接入，优先说明抽象边界有问题，应先重构后扩展。

非目标：

- 不复刻 Kity 的内部 service / command / runtime-interop 架构
- 不兼容 Kity 的内部对象树与渲染对象
- 不优先追求“支持所有 LaTeX 语法”
- 不把 renderer 能显示出来误认为 editor 已可用

## 当前问题总结

### 1. 输入模型过薄

当前 `FormulaRuntimeEditor` 依赖一个隐藏的 `textarea` 来接收输入：

- 见 `packages/runtime/src/editor/FormulaRuntimeEditor.ts`
- 输入框尺寸为 `1px * 1px`
- `opacity: 0`
- `pointerEvents: none`

这意味着：

- 底层可以接输入
- 但真实 modal / 宿主环境里的焦点链路较脆弱
- 当前测试更多验证“隐藏输入框可工作”，而不是“用户自然点击后即可编辑”

### 2. 选区模型过弱

当前 selection 只有：

```ts
interface FormulaSelection {
  rowId: string;
  offset: number;
}
```

这只适合：

- 单点 caret
- 简单左右移动

不适合：

- 范围选择
- 占位符整体选中
- 结构节点整块选中
- 跨层级选择
- 双击整组
- 拖拽选择

### 3. 命令系统过小

当前命令仅覆盖：

- `insertText`
- `insertLatex`
- `deleteBackward`
- `moveLeft`
- `moveRight`
- `moveUp`
- `moveDown`
- `insertFraction`
- `insertSqrt`
- `insertSuperscript`
- `insertSubscript`
- `undo`
- `redo`

这不足以支撑完整编辑器体验。

### 4. 很多结构只是“能显示”，不是“可编辑语义节点”

当前 runtime 的核心节点只有：

- `row`
- `symbol`
- `placeholder`
- `frac`
- `sqrt`
- `script`
- `fence`
- `matrix`
- `unsupported`

这意味着：

- `\int`、`\sum`、`\prod`、`\sin`、`\lim` 等很多元素只是符号映射
- 没有真正独立的 operator / function / large-op 语义
- 很多复杂编辑只能退回文本插入或整段 `unsupported`

### 5. 缺少完整 placeholder 体系

虽然当前模型有 `placeholder` 节点，但它更像工具栏插入的占位标记，还不是完整的交互系统。

缺失点包括：

- placeholder 的语义角色
- placeholder 之间的 tab 顺序
- active / filled / optional / required 状态
- placeholder 选中与删除规则
- 空结构节点的坍缩删除逻辑

## 新 runtime 的总体架构

建议将新 runtime 分为三层：

### 1. `packages/core`

职责：

- 公式 AST
- selection / range / node selection
- transaction
- command
- history
- parser
- serializer
- 纯逻辑编辑规则

要求：

- 纯逻辑
- 无 DOM 依赖
- 可单测覆盖

### 2. `packages/runtime`

职责：

- layout tree
- hit testing
- visual selection / caret / placeholder overlay
- keyboard / IME / pointer bridge
- runtime editor host
- SVG 渲染与视觉反馈

要求：

- 不承载公式语义本身
- 负责把 DOM 事件转换为 core command
- 负责把 core state 映射为可交互视图

### 3. `packages/editor`

职责：

- toolbar
- modal
- 宿主编辑器集成
- runtime 挂载壳层

要求：

- 不再承载编辑语义
- 不再承担 parser / AST 规则

## 新数据结构设计

### 文档对象

```ts
interface FormulaDocument {
  id: string;
  version: number;
  root: FormulaBlockNode;
  diagnostics: FormulaDiagnostic[];
}
```

### 节点体系

建议新的 AST 节点至少包括：

- `Block`
- `Row`
- `TextRun`
- `Symbol`
- `Placeholder`
- `Fraction`
- `Radical`
- `Script`
- `Fence`
- `Matrix`
- `Operator`
- `FunctionCall`
- `DelimitedGroup`
- `Unsupported`

说明：

- `TextRun` 用于连续文本输入，不再把所有字符都拆成离散 `symbol`
- `Operator` 表示积分、求和、乘积等具有结构语义的运算符
- `FunctionCall` 表示 `sin/cos/lim/log` 等函数式节点
- `Placeholder` 是正式 AST 节点，不是 UI 临时标记

### 路径与位置

当前 `rowId + offset` 不足以表达复杂编辑。

建议引入：

```ts
interface FormulaPathSegment {
  nodeId: string;
  field: string;
  index?: number;
}

type FormulaPath = FormulaPathSegment[];
```

并在 selection 中使用路径定位。

### 选区模型

建议统一为：

```ts
type FormulaSelection =
  | CaretSelection
  | RangeSelection
  | NodeSelection
  | PlaceholderSelection;
```

其中：

- `CaretSelection`
  - 单点光标
- `RangeSelection`
  - 范围选择
- `NodeSelection`
  - 结构节点整体选中
- `PlaceholderSelection`
  - placeholder 的结构化选中态

### Placeholder 模型

建议：

```ts
interface PlaceholderNode {
  type: 'placeholder';
  id: string;
  role: string;
  required: boolean;
  state: 'empty' | 'active' | 'filled';
  tabOrder?: number;
}
```

典型 `role`：

- `numerator`
- `denominator`
- `radicand`
- `index`
- `superscript`
- `subscript`
- `matrix-cell`
- `function-arg`

## 编辑事务模型

所有编辑动作统一通过 transaction 驱动。

```ts
interface FormulaTransaction {
  before: FormulaDocument;
  after: FormulaDocument;
  selectionBefore: FormulaSelection | null;
  selectionAfter: FormulaSelection | null;
  reason: FormulaHistoryReason;
  mergeKey?: string;
}
```

收益：

- 历史记录一致
- 撤销/重做一致
- DOM 事件与编辑语义解耦
- 更容易调试和回放

## 输入与交互模型

### 输入原则

输入层只负责采集：

- keyboard
- beforeinput
- IME composition
- paste

它不负责直接修改 DOM 结构。

编辑流程应为：

1. DOM 事件进入 runtime
2. runtime 翻译为 command
3. command 操作 core AST
4. 生成 transaction
5. runtime 重新 layout / render

### 光标与选择

需要支持：

- 单击定位 caret
- 双击选择结构节点或当前组
- 拖拽形成 range selection
- placeholder 单击直接选中
- `Tab / Shift+Tab` 在 placeholders 间跳转
- 光标与选区变化自动同步到可视反馈

### Placeholder 交互

placeholder 是新 runtime 体验的核心。

应具备：

1. 可见
   - 默认有弱边框或虚线框

2. 可聚焦
   - 单击进入选中态

3. 可导航
   - `Tab` 跳转到下一个 required placeholder
   - `Shift+Tab` 回上一个

4. 可替换
   - 输入字符时，placeholder 被内容取代

5. 可恢复
   - 删除到空时恢复 placeholder 状态

6. 可坍缩
   - 对某些空结构，允许整节点删除而不是留下死结构

### 键盘规则

至少要覆盖：

- `ArrowLeft / ArrowRight`
  - 视觉与结构双规则移动
- `ArrowUp / ArrowDown`
  - 二维布局移动
- `Backspace / Delete`
  - 结构化删除
- `Tab / Shift+Tab`
  - placeholder 导航
- `Ctrl/Cmd+Z`
  - undo
- `Ctrl/Cmd+Shift+Z` / `Ctrl/Cmd+Y`
  - redo
- `Ctrl/Cmd+A`
  - select all

### 鼠标规则

至少要覆盖：

- click
  - caret / placeholder / node hit
- double click
  - select current node / group
- drag
  - range selection

## 解析与序列化设计

### 解析器

解析应分层：

1. tokenize
2. parse to AST
3. normalize

目标：

- 不把“不认识”当成默认路径
- 结构优先，不是渲染优先
- 对支持的语法建立真实语义节点

### 序列化器

要求：

- `serialize(parse(latex))` 尽量稳定
- placeholder 节点不直接泄漏到导出的最终 LaTeX
- 内部保留足够信息，以支持编辑往返

## 渲染与命中测试

渲染建议分两步：

1. AST -> LayoutTree
2. LayoutTree -> SVG + overlay

每个可命中片段至少记录：

- `nodeId`
- `path`
- `bounds`
- `caretStops`
- `selectionBounds`
- `placeholderRole`

命中测试不能继续只靠“最近 group + midpoint”。
必须支持：

- 行内精确 caret 定位
- placeholder 命中
- 结构节点整体命中
- wrapped line 内的二维命中

## 约束与边界

### 不再保留的东西

- 不保留 Kity 的 service registry
- 不保留 legacy syntax object tree
- 不保留 Kity 的 command 调度模型
- 不以 Kity 的渲染对象为中间层

### 必须保留的外部能力

对外 API 应保持简洁：

- `mount()`
- `destroy()`
- `focus()`
- `getLatex()`
- `setLatex()`
- `dispatch()`
- `getRenderHtml()`

### 状态归属约束

为避免后续执行跑偏，状态归属必须固定如下：

- AST / diagnostics / transaction / history
  - 归 `packages/core`
- layout tree / hit-test result / visual selection mapping
  - 归 `packages/runtime`
- toolbar open state / modal shell state / host editor adapter state
  - 归 `packages/editor`

任何状态如果同时在两个层级长期保存，都应视为设计告警。

## 执行计划

实施路线、阶段目标、测试策略与里程碑已拆分到：

- [plan.md](./plan.md)

## 最终判断

新的 runtime 应被视为一个全新的公式编辑内核项目，而不是 Kity runtime 的轻量替代层。

Kity 的价值主要在于交互经验，尤其是：

- placeholder 驱动的结构补全
- 光标与选区的稳定反馈
- 树语义删除与导航
- 结构节点整体选择

新 runtime 不需要兼容 Kity 的实现，但必须吸收这些交互原则。

如果后续开始编码，第一步应从：

- AST
- Selection
- Transaction
- Placeholder 模型

四件事开始，而不是继续优先修 toolbar 表现层。

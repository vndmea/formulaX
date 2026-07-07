# Runtime Graph 重构计划

## 目标

本计划用于承接 `ARCHITECTURE.zh-CN.md` 中已经确认的设计方向，聚焦执行路径，而不是重复系统设计本身。

目标是将当前的 runtime-v2 从“可渲染、可做少量结构插入的最小编辑原型”推进为“围绕 LaTeX 编辑设计的结构化公式编辑器”。

## 范围

本计划只覆盖新的 runtime graph 编辑器重构，不包含：

- Kity 内部兼容
- Kity service registry 迁移
- 旧 runtime 的内部对象结构兼容
- 历史包袱适配层

## 当前主要阻塞

### 1. 输入链路脆弱

- 当前编辑能力依赖隐藏输入框
- 测试更多验证“输入框可输入”，而不是“点击即可编辑”
- 真实宿主环境中容易表现为不可编辑

### 2. 选区模型不足

- 只有单点 caret
- 不支持范围选择
- 不支持 placeholder 结构选中
- 不支持拖拽和双击选组

### 3. 结构语义不足

- 许多数学结构仍然是符号级显示
- 缺少真正的 operator / function / structured node
- 工具栏插入大量依赖 `insertLatex(fragment)`

### 4. Placeholder 体系不完整

- 没有完整的 active / empty / filled 状态
- 没有 placeholder 导航
- 没有结构化删除规则

## 执行原则

1. 先稳定核心编辑模型，再扩展 toolbar 与 UI
2. 先建立 AST / Selection / Transaction，再谈复杂交互
3. 先保证“点击即编辑 + placeholder 可用”，再扩展更多 LaTeX 结构
4. 任何阶段都必须带测试推进，不允许只靠手工验证积累能力

## 实施约束

### 1. 禁止重复实现相同能力

在开始任何阶段前，先判断目标功能应归属哪个模块：

- 编辑语义与状态变换：`packages/core`
- 视图命中与交互桥接：`packages/runtime`
- 工具栏、modal、宿主适配：`packages/editor`

同一能力不得在多个模块中各自实现一遍再做同步。

### 2. 禁止多个正式状态源

以下状态必须保持唯一来源：

- document / AST
- selection
- placeholder state
- history

执行中如果出现：

- 需要在 `editor` 维护一份“方便 UI 用的 selection”
- 需要在 `runtime` 再缓存一份长期有效的 placeholder 状态
- 需要在 DOM attribute 中维护另一套事实状态

则应暂停扩展，先收敛状态模型。

### 3. 新功能默认走已有管线

新增编辑能力时，默认必须复用：

- 现有 AST
- 现有 command pipeline
- 现有 transaction / history
- 现有 placeholder 状态机
- 现有 hit-test 输出

只有在无法表达时，才允许扩展抽象，而不是直接复制逻辑。

### 4. UI 不补语义漏洞

如果某个功能只有在 toolbar / modal 层写特殊逻辑才能成立，默认说明 core/runtime 抽象还不完整。

处理原则：

- 优先补 core/runtime 的正式能力
- 不在 `packages/editor` 临时追加一套平行语义

## 分阶段计划

## Phase 1: 编辑核心闭环

### 目标

- 新 AST 基础版本落地
- 新 Selection 模型落地
- Transaction / History 重建
- 基础 Parser / Serializer 闭环完成
- `text / fraction / sqrt / script` 可结构化编辑

### 主要输出

- `packages/core`
  - 新文档模型
  - 新 selection 模型
  - transaction 与 history
  - 基础 command
  - parser / serializer
- `packages/runtime`
  - 最小 editor host
  - 真实点击后输入链路
  - caret 渲染

### 验收标准

- 用户点击公式区域后可直接输入
- 左右移动、删除、撤销、重做稳定
- 分数、根式、上下标插入后可继续编辑
- `parse -> edit -> serialize` 不丢结构

## Phase 2: Placeholder 体系

### 目标

- Placeholder 成为正式 AST 节点
- 完成 placeholder 的视觉态与交互态
- 实现 `Tab / Shift+Tab` 导航
- 实现 placeholder 替换与恢复

### 主要输出

- `PlaceholderNode` 语义字段
- active / empty / filled 状态机
- placeholder hit test
- placeholder selection
- toolbar 插入后的焦点跳转规则

### 验收标准

- 插入分数后焦点自动进入分子 placeholder
- `Tab` 可以进入下一个 placeholder
- 删除空内容后恢复 placeholder
- 用户可以顺畅补全结构，不需要理解底层 AST

## Phase 3: 结构化选择与高级删除

### 目标

- 增加 range selection
- 增加 node selection
- 支持 drag selection
- 支持双击选组
- 完成结构化删除逻辑

### 主要输出

- 选区类型扩展
- selection overlay
- drag interaction
- delete/backspace 结构规则
- `Ctrl/Cmd+A`

### 验收标准

- 支持鼠标拖拽选中一段内容
- 支持双击选中一个结构节点或当前组
- 删除行为符合结构编辑预期

## Phase 4: 语义节点扩展

### 目标

- 扩展 operator / function / fence / matrix 语义节点
- 减少对整段 latex fragment 插入的依赖

### 主要输出

- `OperatorNode`
- `FunctionCallNode`
- 更稳定的 fence / matrix 语义解析
- 工具栏结构模板到语义命令的映射

### 验收标准

- 积分、求和、函数等进入真正结构语义
- 主要 toolbar 项不再主要靠 `insertLatex(fragment)`

## Phase 5: 集成与体验打磨

### 目标

- editor/modal/toolbar 全面接入新 runtime
- 宿主编辑器下验证真实输入与交互
- 打磨滚动、焦点、输入法、可访问性

### 主要输出

- `packages/editor` 接入改造
- 集成 E2E
- 输入法与 focus 细节修复
- placeholder 与 selection 的视觉优化

### 验收标准

- 在 modal 中点击即可编辑
- 在 TinyMCE / Tiptap 等宿主中输入稳定
- 用户不再感知“runtime 可渲染但不可编辑”

## 测试计划

### Core 单测

覆盖：

- AST 变换
- selection 变换
- transaction / history
- parser / serializer
- placeholder 状态流转

### Runtime DOM 测试

覆盖：

- caret
- selection overlay
- placeholder 渲染
- hit testing
- keyboard 命令分发

### Browser E2E

必须覆盖：

- 点击后直接输入
- toolbar 插入后 placeholder 导航
- undo / redo
- drag selection
- modal 场景可编辑
- IME 输入

## 模块拆分建议

### `packages/core`

优先新增或重构：

- `document/*`
- `selection/*`
- `transactions/*`
- `commands/*`
- `parser/*`
- `serializer/*`

### `packages/runtime`

优先新增或重构：

- `editor/*`
- `input/*`
- `hit-test/*`
- `layout/*`
- `view/*`
- `selection-overlay/*`

### `packages/editor`

在 runtime 核心稳定前，尽量不继续扩展复杂交互逻辑，只保留挂载与 UI 适配。

## 复用优先检查清单

每进入一个子任务前，先过一遍：

1. 这个能力是否已经在别处存在同类实现
2. 能否通过扩展现有 AST / command / transaction 完成
3. 是否会引入第二份 selection / placeholder / history 状态
4. 是否会让 `packages/editor` 持有本应属于 `core` 或 `runtime` 的语义
5. 是否需要先抽公共层，再继续实现功能

## 风险

### 1. 继续在旧 runtime-v2 上叠补

风险：

- 复杂度上升很快
- 局部可用但整体体验仍碎裂
- 修复一个点会牵动更多输入和 selection 问题

策略：

- 停止把 runtime-v2 当最终形态维护
- 把它视为过渡实现

### 2. Parser 过早追求“大而全”

风险：

- 语义节点尚未稳定时，parser 容易越写越散

策略：

- 先支持核心结构
- 对扩展语法分阶段推进

### 3. 测试继续偏向实现细节

风险：

- 测试看起来很多，但不覆盖用户真实路径

策略：

- Browser E2E 以用户行为为中心
- 少测隐藏输入框，多测点击后输入

## 暂不做

以下内容不应进入第一阶段：

- 与 Kity 的内部对象兼容
- 复刻 Kity 的全部 operator 体系
- 所有 LaTeX 语法一次性支持
- 高级打印 / 导出 / image 流程打磨

## 第一阶段推荐起点

建议按下面顺序开工：

1. 定义新 AST
2. 定义新 Selection
3. 定义 Transaction / History
4. 实现基础 Parser / Serializer
5. 重建最小可编辑 Editor Host
6. 接入 Fraction / Sqrt / Script
7. 接入 Placeholder 基础能力

## 里程碑

### Milestone A

- 能点击输入
- 能删除
- 能撤销重做
- 能插入基础结构

### Milestone B

- Placeholder 成型
- Tab 导航可用
- 结构补全体验可接受

### Milestone C

- 结构选择与高级删除可用
- modal 内编辑稳定

### Milestone D

- 主要 toolbar 结构语义化
- 新 runtime 可作为默认编辑内核推进

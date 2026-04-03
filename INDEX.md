# Claude Code Evolution - 内容索引

> 汲取自 `ra1nzzz/claude-code-evolution` | 2026-04-04 更新

---

## 📂 技能（Skills）

| 技能 | 功能 | 触发词 |
|------|------|--------|
| `claude-code-simplify` | 并行三阶段代码审查 | `/simplify` |
| `claude-code-remember` | 记忆管理与整理 | `/remember` |
| `claude-code-verify` | 破坏性验证 + 系统化测试 | `/verify` |
| `claude-code-debug` | 系统化调试辅助 | `/debug` |
| `section-cache` | System Prompt 分层缓存 | `section cache` |

---

## 📚 参考文档（References）

### 架构类

| 文档 | 核心内容 |
|------|---------|
| `references/task-system.md` | 7种任务类型、ProgressTracker、Task 状态机 |
| `references/agent-system.md` | AgentTool 框架、内置 Agent（plan/explore/verification/guide）|
| `references/permission-system.md` | 文件系统权限请求 UI、权限模式 |
| `references/prompt-patterns.md` | Section 缓存 API、Prompt 构建优先级、Attribution Header |

### 提示词工程

| 文档 | 来源 |
|------|------|
| `system-prompt/core/` | 核心身份、安全规则、能力边界 |
| `system-prompt/tools/` | 文件操作指南、Agent 协作指南 |
| `system-prompt/dynamic/` | 动态上下文模板 |

---

## 🔑 核心设计模式（快速查阅）

### 1. Section 缓存（section-cache skill）

```typescript
// 带缓存 section
systemPromptSection(name, compute)

// 无缓存 section（每轮重算）
DANGEROUS_uncachedSystemPromptSection(name, compute, reason)
```

### 2. Task 状态机（task-system.md）

```typescript
// Background task 判断
isBackgroundTask(task: TaskState): boolean

// ProgressTracker - token 计算
latestInputTokens: number   // 取最新（API 累计）
cumulativeOutputTokens: number  // 每 turn 求和
```

### 3. Verification Agent 策略（agent-system.md）

```typescript
// 核心原则：不是确认它能工作，而是尝试破坏它
// 反 rationalization：
// - "代码看起来正确" ≠ 验证。运行它。
// - "实现者测试已通过" ≠ 验证。独立验证。
```

### 4. Agent 加载（agent-system.md）

```typescript
// 支持 MCP server 内联
type AgentMcpServerSpec = string | { [name: string]: McpServerConfig }
```

### 5. System Prompt 优先级（prompt-patterns.md）

```
overrideSystemPrompt → coordinatorSystemPrompt → agentPrompt
→ customSystemPrompt → defaultSystemPrompt → appendSystemPrompt
```

---

## 🛠️ 实现代码（implementations/）

| 文件 | 功能 |
|------|------|
| `implementations/section-cache.ts` | Section 缓存逻辑 |
| `implementations/context-generator.ts` | 动态上下文生成 |
| `implementations/agent-coordinator.ts` | 并行 Agent 协调 |
| `implementations/memory-manager.ts` | 三层记忆管理 |

---

## 📋 使用场景对照

| 场景 | 用哪个 |
|------|--------|
| 代码审查 + 找可复用代码 | `claude-code-simplify` |
| 验证任务是否真正完成 | `claude-code-verify` |
| 遇到 bug 需要系统化排查 | `claude-code-debug` |
| 记忆混乱需要整理 | `claude-code-remember` |
| 减少 token 消耗 | `section-cache` skill |
| 了解 Task 系统设计 | `references/task-system.md` |
| 设计新的 Agent 能力 | `references/agent-system.md` |
| 理解 System Prompt 架构 | `references/prompt-patterns.md` |
| 实现权限请求 UI | `references/permission-system.md` |

---

*此索引随汲取进度更新。每次新增内容后同步更新本文档。*

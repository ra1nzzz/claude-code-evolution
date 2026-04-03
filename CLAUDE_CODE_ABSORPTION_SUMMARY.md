# Claude Code 源码汲取总结

> 完成时间: 2026-04-03 | 最后更新: 2026-04-04
> 源码仓库: https://github.com/ra1nzzz/claude-code-src

---

## 📊 分析概况

- **仓库规模**: ~1903 个文件，约 51.2 万行代码
- **核心语言**: TypeScript
- **运行时**: Bun
- **终端 UI**: React + Ink
- **分析深度**: 架构设计、提示词工程、Skill 系统、Agent 系统

---

## ✅ 已完成内容

### Phase 1: Skill 迁移 ✓

| Skill | 功能 | 触发词 |
|-------|------|--------|
| **claude-code-simplify** | 代码审查（3个并行 agent） | /simplify, 审查代码 |
| **claude-code-remember** | 记忆管理和整理 | /remember, 整理记忆 |
| **claude-code-verify** | 任务完成度验证 | /verify, 验证任务 |
| **claude-code-debug** | 系统化调试辅助 | /debug, 调试 |

### Phase 2: 系统提示词优化 ✓

```
system-prompt/
├── core/
│   ├── identity.md         # 核心身份定义
│   ├── safety.md           # 安全规则
│   └── capabilities.md     # 能力边界
├── tools/
│   ├── file-operations.md  # 文件操作指南
│   └── agent-operations.md # Agent 协作指南
├── dynamic/
│   └── session-context.md  # 动态上下文模板
└── README.md              # 架构说明
```

### Phase 3: 高级功能实现 ✓

| 模块 | 功能 |
|------|------|
| **Section Cache** | 提示词 section 缓存 |
| **Context Generator** | 动态上下文生成 |
| **Agent Coordinator** | 并行 Agent 协调 |
| **Memory Manager** | 三层记忆管理 |

---

## 🆕 Phase 4: 新增内容（2026-04-04）

### 新增 Reference 文档

| 文档 | 内容 |
|------|------|
| **references/task-system.md** | 7种任务类型、ProgressTracker、Task 状态机 |
| **references/agent-system.md** | AgentTool 框架、加载机制、内置 Agent |
| **references/permission-system.md** | 文件系统权限请求 UI、权限模式 |
| **references/prompt-patterns.md** | Section 缓存 API、Prompt 构建优先级、Attribution Header |

### Task System 核心要点

```
TaskState 联合类型:
├── LocalShellTask      # 本地 shell 命令
├── LocalAgentTask     # Fork 子 agent（ProgressTracker）
├── RemoteAgentTask    # 远程 agent
├── InProcessTeammateTask
├── DreamTask         # 自动记忆整合（UI 可视化）
└── ...
```

**ProgressTracker 关键设计：**
- `latestInputTokens`: API 累计值，取最新
- `cumulativeOutputTokens`: 每 turn 求和
- `recentActivities[]`: 最近 N 次工具调用

### Agent System 核心要点

**内置 Agent（built-in）：**
- `planAgent` — 只读架构规划，READ-ONLY 模式
- `exploreAgent` — 快速文件搜索，并行工具调用
- `verificationAgent` — 破坏性验证，系统性测试策略
- `claudeCodeGuideAgent` — Claude Code/SDK/API 文档助手

**Agent 定义格式：** JSON/YAML schema，支持 tools 列表、disallowedTools、MCP server 内联

### Verification Agent 核心策略

```typescript
// 核心原则：不是确认它能工作，而是尝试破坏它
// 反 rationalization 规则：
// - "代码看起来正确" ≠ 验证。运行它。
// - "实现者测试已通过" ≠ 验证。独立验证。
// - "大概没问题" ≠ 验证。运行它。
```

### System Prompt 缓存 API

```typescript
// 带缓存 section（默认）
systemPromptSection(name, compute)  // /clear 或 /compact 时清除

// 无缓存 section（每轮重算）
DANGEROUS_uncachedSystemPromptSection(name, compute, reason)
// 需要 reason 参数说明为什么打破缓存
```

### Permission System

```typescript
PERMISSION_MODES = ['read', 'write', 'bypass']
// read:   仅读取
// write:  写入前请求确认
// bypass: 完全绕过
```

---

## 📁 完整文件清单

```
claude-code-evolution/
├── CLAUDE_CODE_ABSORPTION_SUMMARY.md
├── README.md
├── references/
│   ├── task-system.md           # 🆕 Task 系统架构
│   ├── agent-system.md         # 🆕 Agent 系统框架
│   ├── permission-system.md    # 🆕 权限系统
│   └── prompt-patterns.md      # 🆕 提示词工程模式
├── skills/
│   ├── SKILL.md
│   ├── claude-code-debug/
│   ├── claude-code-remember/
│   ├── claude-code-simplify/
│   ├── claude-code-verify/
│   ├── sumra-deploy-verify/
│   └── sumra-memory/
└── system-prompt/
    ├── core/
    ├── dynamic/
    ├── tools/
    └── README.md
```

---

## 待补充（低优先级）

- [ ] Vim Mode 详细实现文档（状态机设计）
- [ ] Voice Mode 实现
- [ ] MCP Tool 框架
- [ ] Telemetry 系统

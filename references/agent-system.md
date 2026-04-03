# Built-in Agent System & AgentTool Framework

> 来源: `src/tools/AgentTool/` — Claude Code 内置 Agent 系统
> 整理: Lucy | 2026-04-04

---

## AgentTool 架构

AgentTool 是 Claude Code 的核心工具之一，允许启动子 agent 完成任务。架构分为：

```
AgentTool (主工具)
├── AgentTool.tsx         # UI 渲染
├── loadAgentsDir.ts      # 动态加载 agents 目录
├── builtInAgents.ts     # 内置 agent 注册表
├── built-in/
│   ├── generalPurposeAgent.ts
│   ├── planAgent.ts
│   ├── exploreAgent.ts
│   ├── verificationAgent.ts
│   ├── claudeCodeGuideAgent.ts
│   └── statuslineSetup.ts
├── runAgent.ts          # Agent 运行逻辑
├── forkSubagent.ts       # Fork 新进程
├── resumeAgent.ts       # 恢复 agent
├── agentMemory.ts       # Agent 记忆
├── agentMemorySnapshot.ts
├── agentColorManager.ts
├── agentDisplay.ts
└── constants.ts
```

---

## Agent 定义格式

### JSON Schema（`loadAgentsDir.ts`）

```typescript
const AgentJsonSchema = z.object({
  description: z.string().min(1),
  tools: z.array(z.string()).optional(),
  disallowedTools: z.array(z.string()).optional(),
  prompt: z.string().min(1),
  model: z.string().optional(),
  mentionOnly: z.boolean().optional(),
})

// 支持 MCP server 内联定义
type AgentMcpServerSpec = string | { [name: string]: McpServerConfig }
```

### YAML 格式

```yaml
# .agents/plan-agent/agent.yaml
description: Architecture planning specialist
tools: [Read, Edit, Bash]
prompt: |
  You are a software architect...

# 可选：agent 目录下放 markdown 文件作为 prompt
# 或通过 frontmatter 指定 tools
```

---

## 内置 Agent 列表

### 1. General Purpose Agent

通用目的 agent，无特殊限制。

### 2. Plan Agent

**文件：** `built-in/planAgent.ts`

**用途：** 软件架构和规划专家，只读模式探索代码库并设计实现计划。

**核心约束：**
- READ-ONLY 模式，禁止任何文件修改
- 只允许 `ls`, `git status`, `git log`, `git diff`, `find`, `grep`, `cat`, `head`, `tail`
- 禁止：`mkdir`, `touch`, `rm`, `cp`, `mv`, `npm install`, `pip install`

**搜索工具提示：**
```typescript
const searchToolsHint = hasEmbeddedSearchTools()
  ? `\`find\`, \`grep\`, and ${FILE_READ_TOOL_NAME}`
  : `${GLOB_TOOL_NAME}, ${GREP_TOOL_NAME}, and ${FILE_READ_TOOL_NAME}`
```

---

### 3. Explore Agent

**文件：** `built-in/exploreAgent.ts`

**用途：** 文件搜索专家，快速搜索和分析代码库。

**核心约束：**
- READ-ONLY 探索任务
- 使用 glob + grep 高效搜索
- 并行工具调用以提高速度
- 最小查询数：3（`EXPLORE_AGENT_MIN_QUERIES = 3`）

**工具选择：**
```typescript
// 根据是否有 embedded search tools 选择不同路径
const globGuidance = embedded
  ? `- Use \`find\` via Bash for broad file pattern matching`
  : `- Use Glob for broad file pattern matching`
```

---

### 4. Verification Agent

**文件：** `built-in/verificationAgent.ts`

**用途：** 验证专家，专门尝试破坏实现，不是确认它能工作。

**核心原则：**
- 不修改项目
- 不运行 `git write` 操作
- 可以写临时测试脚本到 `/tmp`

**验证策略（按类型）：**

| 变更类型 | 验证策略 |
|----------|----------|
| 前端变更 | 启动 dev server → 浏览器自动化 → 截图验证 |
| 后端/API 变更 | 启动 server → curl endpoints → 验证响应 shape |
| CLI 变更 | 运行代表性输入 → 验证 stdout/stderr/exit codes |
| 基础设施 | 语法验证 → dry-run → 检查 env vars |
| 库/包变更 | 构建 → 测试套件 → 导入验证公开 API |
| Bug 修复 | 复现 bug → 验证修复 → 回归测试 |
| 数据库迁移 | 向上 → 验证 schema → 向下（可逆性）→ 数据测试 |
| 重构 | 测试套件必须通过 → 公开 API surface 不变 |

**关键反 rationalization 规则：**
- "代码看起来正确" ≠ 验证。运行它。
- "实现者的测试已经通过" ≠ 验证。独立验证。
- "大概没问题" ≠ 验证。运行它。

---

### 5. Claude Code Guide Agent

**文件：** `built-in/claudeCodeGuideAgent.ts`

**用途：** 帮助用户理解和使用 Claude Code、Claude Agent SDK、Claude API。

**三个领域：**
1. **Claude Code**（CLI）：安装、配置、hooks、skills、MCP、IDE 集成
2. **Claude Agent SDK**：基于 Claude Code 技术的自定义 agent 框架
3. **Claude API**：直接模型交互、工具使用、集成

**文档源：**
- Claude Code docs: `https://code.claude.com/docs/en/claude_code_docs_map.md`
- Claude API docs: `https://platform.claude.com/llms.txt`

---

## Agent 加载机制

```typescript
// loadAgentsDir.ts
export async function loadAgentsDir(): Promise<AgentDefinition[]> {
  // 1. 扫描 .agents/ 目录
  // 2. 加载 YAML/JSON 定义
  // 3. 解析 frontmatter 中的 tools
  // 4. 合并内置 agents
  // 5. 缓存结果
}

// 内置 agent 注册
export function getBuiltInAgents(): BuiltInAgentDefinition[] {
  return [PLAN_AGENT, EXPLORE_AGENT, VERIFICATION_AGENT, ...]
}
```

---

## MCP Server 内联

Agent 定义支持内联 MCP server：

```typescript
type AgentMcpServerSpec =
  | string  // 引用已有 server
  | { [name: string]: McpServerConfig }  // 内联定义

// agent.yaml
mcpServers:
  my-server:
    command: npx
    args: ["-y", "@scope/mcp-server"]
```

---

## Agent 记忆系统

```typescript
// agentMemory.ts
export function loadAgentMemoryPrompt(
  agentId: string,
  scope: AgentMemoryScope
): string {
  // 加载 agent 的记忆 prompt
}

// agentMemorySnapshot.ts
export function checkAgentMemorySnapshot(agentId: string): boolean
export function initializeFromSnapshot(agentId: string): void
```

---

## 权限模式

```typescript
// loadAgentsDir.ts
PERMISSION_MODES = ['read', 'write', 'bypass']

// agent.yaml
permissions:
  mode: 'read'  # 仅读取
  # 或
  mode: 'write'  # 读写
  # 或
  mode: 'bypass'  # 绕过提示
```

---

## OpenClaw 适配建议

### 对应 OpenClaw 实现

OpenClaw 的 `sessions_spawn` 可对标此框架：

```typescript
// OpenClaw sessions_spawn 参数
sessions_spawn(
  task: string,           // Agent prompt
  runtime: 'subagent' | 'acp',
  mode: 'run' | 'session',
  model?: string,
  thread?: boolean
)

// 建议增强：
// 1. 内置 agent 预定义（类似 plan/explore/verification）
// 2. agent 目录动态加载
// 3. MCP server 内联支持
```

### 关键可移植设计

1. **Agent 定义格式**：JSON/YAML schema 可直接移植
2. **readOnly 约束**：plan/explore agent 的只读模式设计可借鉴
3. **验证策略**：verificationAgent 的系统性验证方法论
4. **工具提示动态化**：`hasEmbeddedSearchTools()` 判断用于选择工具名

---

## 参考源码

| 文件 | 作用 |
|------|------|
| `src/tools/AgentTool/loadAgentsDir.ts` | Agent 动态加载框架 |
| `src/tools/AgentTool/builtInAgents.ts` | 内置 Agent 注册表 |
| `src/tools/AgentTool/runAgent.ts` | Agent 运行逻辑 |
| `src/tools/AgentTool/forkSubagent.ts` | Fork 子进程 |
| `src/tools/AgentTool/built-in/planAgent.ts` | Plan Agent（只读规划）|
| `src/tools/AgentTool/built-in/exploreAgent.ts` | Explore Agent（快速搜索）|
| `src/tools/AgentTool/built-in/verificationAgent.ts` | Verification Agent（破坏性验证）|

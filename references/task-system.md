# Task System Architecture

> 来源: `src/tasks/` — Claude Code 任务系统深度解析
> 整理: Lucy | 2026-04-04

---

## 核心设计思想

Claude Code 的 Task 系统是一个**统一的生命周期管理框架**，支持多种任务类型在同一套 API 下运行。每种任务类型都是 `TaskState` 的子类型，共享注册、更新、停止的通用接口。

---

## 任务类型体系

```
TaskState (联合类型)
├── LocalShellTask          # 本地 shell 命令
├── LocalAgentTask         # 本地子 agent（fork）
├── RemoteAgentTask        # 远程 agent
├── InProcessTeammateTask  # 同进程 teammate
├── LocalWorkflowTask      # 本地工作流
├── MonitorMcpTask         # MCP 监控任务
└── DreamTask             # 记忆整合任务（auto-dream）
```

---

## 通用 API

### 注册任务

```typescript
import { registerTask } from '../../utils/task/framework.js'

const taskId = registerTask(task, setAppState)
// task: TaskState 任意子类型
// 返回 taskId (string)
```

### 更新状态

```typescript
import { updateTaskState } from '../../utils/task/framework.js'

updateTaskState(taskId, newState, setAppState)
// 合并更新，支持 partial update
```

### 停止任务

```typescript
import { stopTask } from '../stopTask.js'
// 支持 abort signal 自动传播
```

---

## 任务状态机

```
pending → running → completed
           ↓
        failed / aborted
           ↓
        stopped
```

**Background Task 判断：**

```typescript
export function isBackgroundTask(task: TaskState): boolean {
  if (task.status !== 'running' && task.status !== 'pending') {
    return false
  }
  // 显式 background 的才是 background task
  if ('isBackgrounded' in task && task.isBackgrounded === false) {
    return false
  }
  return true
}
```

---

## 核心数据结构

### TaskStateBase

所有任务状态的基类：

```typescript
type TaskStateBase = {
  id: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped' | 'aborted'
  startedAt: number
  updatedAt: number
  isBackgrounded?: boolean
}
```

### ProgressTracker（LocalAgentTask 专用）

追踪 agent 进度：

```typescript
export type ProgressTracker = {
  toolUseCount: number
  latestInputTokens: number      // API 累计 input tokens
  cumulativeOutputTokens: number  // 每 turn 求和
  recentActivities: ToolActivity[]  // 最近 N 次工具调用
}

export function updateProgressFromMessage(
  tracker: ProgressTracker,
  message: Message,
  resolveActivityDescription?: ActivityDescriptionResolver
): void
```

**Token 计算逻辑：**
- input_tokens：取最新值（API 是累计的）
- output_tokens：累加每 turn 的值

---

## DreamTask（自动记忆整合）

**设计目的：** 让 invisible 的 forked agent 记忆整合任务在 UI 上可见。

**状态：**

```typescript
type DreamTaskState = TaskStateBase & {
  type: 'dream'
  phase: 'starting' | 'updating'
  sessionsReviewing: number
  filesTouched: string[]     // 不完整的"至少改了这些"
  turns: DreamTurn[]         // 助手回复，工具调用折叠为计数
  abortController?: AbortController
  priorMtime: number
}
```

**注册函数：**

```typescript
export function registerDreamTask(
  setAppState: SetAppState,
  opts: {
    sessionsReviewing: number
    priorMtime: number
    abortController: AbortController
  }
): string
```

**Phase 转换：** `starting` → `updating`（第一个 Edit/Write 工具调用出现时）

---

## LocalAgentTask（Fork 子 Agent）

**核心能力：**
- 在后台运行 forked agent
- 实时追踪 progress（token count、tool use count）
- 通过 SDK progress 事件流接收更新
- 支持 task output 持久化到磁盘

**Progress 事件流：**

```typescript
// SDK 端
emitTaskProgress(taskId, progress: AgentProgress)

// UI 端
import { registerTask, updateTaskState } from '../../utils/task/framework.js'
```

---

## 磁盘输出持久化

```typescript
import {
  initTaskOutputAsSymlink,
  getTaskOutputPath,
  evictTaskOutput
} from '../../utils/task/diskOutput.js'

// 初始化：创建符号链接到任务输出
initTaskOutputAsSymlink(taskId)

// 获取输出路径
const outputPath = getTaskOutputPath(taskId)

// 驱逐旧任务输出
evictTaskOutput(taskId)
```

---

## Pill 显示标签

`src/tasks/pillLabel.ts` — 底部状态栏任务药丸标签逻辑。

---

## OpenClaw 适配建议

### 对应 OpenClaw 实现

```typescript
// OpenClaw 的任务框架应支持：
// 1. 统一的任务注册 API
// 2. ProgressTracker 机制（token/tool 计数）
// 3. Background task 判断逻辑
// 4. 任务 abort signal 传播
// 5. 磁盘输出持久化（长时间任务）

interface OpenClawTaskState {
  id: string
  type: 'shell' | 'agent' | 'teammate' | 'dream'
  status: TaskStatus
  progress?: ProgressTracker
  abortController?: AbortController
  outputPath?: string
}
```

### 关键参考点

1. **Progress 追踪**：LocalAgentTask 的 `updateProgressFromMessage` 逻辑可以直接移植
2. **isBackgroundTask**：判断逻辑用于 UI 显示过滤
3. **Task State Union**：不同任务类型共享同一套更新 API
4. **Abort Signal**：通过 `AbortController` 传播停止信号

---

## 参考源码

| 文件 | 作用 |
|------|------|
| `src/tasks/types.ts` | TaskState 联合类型定义 |
| `src/tasks/LocalAgentTask/LocalAgentTask.tsx` | Fork agent 任务实现 |
| `src/tasks/RemoteAgentTask/RemoteAgentTask.ts` | 远程 agent 任务 |
| `src/tasks/DreamTask/DreamTask.ts` | Auto-dream 任务 |
| `src/tasks/stopTask.ts` | 统一停止逻辑 |
| `src/utils/task/framework.js` | 注册/更新通用 API |
| `src/utils/task/diskOutput.js` | 磁盘输出持久化 |

# Prompt Patterns & System Prompt Architecture

> 来源: `src/constants/systemPromptSections.ts`, `src/utils/systemPrompt.ts`, `src/constants/system.ts`
> 整理: Lucy | 2026-04-04

---

## System Prompt Section 缓存 API

Claude Code 的 system prompt 构建核心：

```typescript
// src/constants/systemPromptSections.ts

type ComputeFn = () => string | null | Promise<string | null>

type SystemPromptSection = {
  name: string
  compute: ComputeFn
  cacheBreak: boolean  // 是否打破缓存
}

/**
 * 创建带缓存的 section（默认）
 * 计算一次，之后缓存，/clear 或 /compact 时清除
 */
export function systemPromptSection(
  name: string,
  compute: ComputeFn,
): SystemPromptSection

/**
 * 创建无缓存 section（每轮重新计算）
 * 会打破 prompt 缓存，需要说明原因
 */
export function DANGEROUS_uncachedSystemPromptSection(
  name: string,
  compute: ComputeFn,
  _reason: string,  // 必须提供，说明为什么需要每轮重算
): SystemPromptSection

/**
 * 解析所有 section，返回 prompt 字符串数组
 */
export async function resolveSystemPromptSections(
  sections: SystemPromptSection[]
): Promise<(string | null)[]>
```

---

## System Prompt 构建优先级

`src/utils/systemPrompt.ts` 中的 `buildEffectiveSystemPrompt` 函数：

```typescript
export function buildEffectiveSystemSystemPrompt({
  overrideSystemPrompt,     // 优先级 0：完全替换
  mainThreadAgentDefinition, // 优先级 1：coordinator/agent 模式
  customSystemPrompt,       // 优先级 2：用户自定义
  defaultSystemPrompt,      // 优先级 3：默认
  appendSystemPrompt,       // 始终追加（除非 override 已设置）
}): SystemPrompt
```

**优先级顺序：**
1. `overrideSystemPrompt` → 完全替换所有其他 prompt
2. `coordinatorSystemPrompt` → coordinator 模式专用
3. `agentSystemPrompt` → agent 定义的 prompt
4. `customSystemPrompt` → 用户指定
5. `defaultSystemPrompt` → 标准 Claude Code prompt
6. `appendSystemPrompt` → 永远追加在最后

---

## System Prompt 前缀

`src/constants/system.ts` 定义了三种 CLI 前缀：

```typescript
const CLI_SYSPROMPT_PREFIX_VALUES = [
  "You are Claude Code, Anthropic's official CLI for Claude.",  // 默认
  "You are Claude Code, Anthropic's official CLI for Claude, running within the Claude Agent SDK.",  // SDK 模式 + append
  "You are a Claude agent, built on Anthropic's Claude Agent SDK.",  // 非交互式
] as const

export function getCLISyspromptPrefix(options?: {
  isNonInteractive: boolean
  hasAppendSystemPrompt: boolean
}): CLISyspromptPrefix
```

**选择逻辑：**
- Vertex API → 返回默认前缀
- 非交互式 + 有 append → SDK preset 前缀
- 非交互式 → SDK 前缀
- 其他 → 默认前缀

---

## Attribution Header

```typescript
// API 请求头，标识 Claude Code 客户端
export function getAttributionHeader(fingerprint: string): string {
  // 返回格式：
  // x-anthropic-billing-header: cc_version={version}; cc_entrypoint={entrypoint}; cc_workload={workload}
}
```

**包含内容：**
- `cc_version`: 版本号 + 指纹
- `cc_entrypoint`: 入口点（'unknown' 或 'cli'）
- `cc_workload`: turn-scoped 提示，用于 API 路由
- `cch`: Native Client Attestation token（可选）

---

## Coordinator Mode

```typescript
// 懒加载，避免循环依赖
const { getCoordinatorSystemPrompt } = require('../coordinator/coordinatorMode.js')

// coordinator 模式下用专用 prompt 而非默认 prompt
if (feature('COORDINATOR_MODE') && isEnvTruthy(process.env.CLAUDE_CODE_COORDINATOR_MODE)) {
  return asSystemPrompt([getCoordinatorSystemPrompt(), appendSystemPrompt])
}
```

---

## Feature Flag 模式

```typescript
// Dead code elimination: 条件导入
/* eslint-disable @typescript-eslint/no-require-imports */
const proactiveModule =
  feature('PROACTIVE') || feature('KAIROS')
    ? require('../proactive/index.js')
    : null
/* eslint-enable @typescript-eslint/no-require-imports */

function isProactiveActive_SAFE_TO_CALL_ANYWHERE(): boolean {
  return proactiveModule?.isProactiveActive() ?? false
}
```

---

## OpenClaw 适配建议

### Section Cache（已实现）

OpenClaw 的 `section-cache` 插件实现了类似机制：

```typescript
// 静态 section → 跨 turn 缓存
// 动态 section → 每 turn 重算

interface Section {
  name: string
  content: string | null
  cacheBreak: boolean
}
```

### Prompt 构建优先级

OpenClaw 应支持类似的优先级覆盖机制：

```typescript
interface SystemPromptConfig {
  override?: string      // 完全替换
  agent?: string        // Agent 定义
  custom?: string       // 用户自定义
  default: string[]    // 默认
  append?: string       // 追加
}
```

---

## 参考源码

| 文件 | 作用 |
|------|------|
| `src/constants/systemPromptSections.ts` | Section 缓存 API |
| `src/utils/systemPrompt.ts` | Prompt 构建逻辑 |
| `src/constants/system.ts` | CLI 前缀和 Attribution Header |

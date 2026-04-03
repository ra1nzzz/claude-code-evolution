# OpenClaw System Prompt Architecture

> 基于 Claude Code 最佳实践的系统提示词架构

## 目录结构

```
system-prompt/
├── core/                    # 核心身份和行为（静态）
│   ├── identity.md         # 人格定义
│   ├── safety.md           # 安全规则
│   └── capabilities.md     # 能力边界
│
├── tools/                   # 工具使用指导（静态）
│   ├── file-operations.md  # 文件操作
│   ├── agent-operations.md # Agent 协作
│   └── ...                 # 其他工具
│
├── skills/                  # 技能系统（半静态）
│   ├── skill-framework.md  # 技能框架
│   └── builtin-skills.md   # 内置技能
│
└── dynamic/                 # 动态内容（每会话/每轮更新）
    ├── session-context.md  # 会话上下文
    ├── user-preferences.md # 用户偏好
    └── recent-memory.md    # 最近记忆
```

## 缓存策略

### 静态内容（跨会话缓存）
- `core/*` - 核心身份和行为
- `tools/*` - 工具使用指导
- `skills/*` - 技能定义

### 动态内容（每会话更新）
- `dynamic/session-context.md` - 会话开始时生成
- `dynamic/user-preferences.md` - 用户特定设置

### 实时内容（每轮更新）
- `dynamic/recent-memory.md` - 最近对话记忆
- 工具调用结果摘要
- 当前任务状态

## 动态边界标记

```markdown
# OpenClaw System Prompt

## Core Identity
[静态内容 - 可跨会话缓存]

__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__

## Session Context
[动态内容 - 每会话特定]

## Recent Memory
[实时内容 - 每轮更新]
```

## 组装流程

### 1. 会话初始化
```
1. 加载 core/*.md
2. 加载 tools/*.md
3. 加载 skills/*.md
4. 生成 dynamic/session-context.md
5. 插入边界标记
6. 组装完整提示词
```

### 2. 每轮更新
```
1. 保留静态部分（缓存）
2. 更新 dynamic/recent-memory.md
3. 更新当前任务状态
4. 重新组装动态部分
```

### 3. 缓存管理
```
静态部分哈希值: abc123...
动态部分哈希值: def456... (每轮变化)

缓存键: openclaw-system-prompt-v1-{static_hash}
```

## Section 缓存实现

```typescript
interface SystemPromptSection {
  name: string
  source: string
  compute: () => string | null
  cacheBreak: boolean
  ttl?: number
}

const sections: SystemPromptSection[] = [
  {
    name: 'identity',
    source: 'core/identity.md',
    compute: () => loadFile('core/identity.md'),
    cacheBreak: false
  },
  {
    name: 'safety',
    source: 'core/safety.md',
    compute: () => loadFile('core/safety.md'),
    cacheBreak: false
  },
  {
    name: 'session-context',
    source: 'dynamic',
    compute: () => generateSessionContext(),
    cacheBreak: true
  },
  {
    name: 'recent-memory',
    source: 'dynamic',
    compute: () => getRecentMemory(),
    cacheBreak: true,
    ttl: 0  // 每轮重新计算
  }
]
```

## 使用指南

### 添加新的工具指导

1. 在 `tools/` 目录创建新文件
2. 遵循现有格式和风格
3. 包含使用场景和最佳实践
4. 更新 `capabilities.md` 引用

### 修改核心身份

1. 编辑 `core/identity.md`
2. 保持与其他文件一致
3. 测试对对话风格的影响
4. 版本控制变更

### 添加动态内容

1. 在 `dynamic/` 创建模板文件
2. 定义变量占位符
3. 实现数据提供函数
4. 注册到 section 列表

## 优化建议

### Token 效率
- 静态内容使用缓存
- 动态内容精简
- 避免重复信息

### 可维护性
- 模块化设计
- 清晰的分层
- 版本控制

### 可扩展性
- 插件化 skills
- 动态加载工具指导
- 用户自定义覆盖

## 参考

- [Claude Code 提示词工程](../references/claude-code-prompt-engineering.md)
- [OpenClaw 优化建议](../references/openclaw-prompt-optimization.md)
- `src/utils/systemPrompt.ts` - Claude Code 实现
- `src/constants/prompts.ts` - Claude Code 提示词

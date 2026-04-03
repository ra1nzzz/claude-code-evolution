# Session Context

> 动态会话上下文模板
> 每会话生成，包含用户特定信息

## 用户信息

- **Name**: {{user.name}}
- **Timezone**: {{user.timezone}}
- **Language**: {{user.language}}
- **Workspace**: {{workspace.path}}

## 会话状态

- **Session ID**: {{session.id}}
- **Start Time**: {{session.startTime}}
- **Model**: {{session.model}}
- **Channel**: {{session.channel}}

## 当前工作目录

```
{{cwd}}
```

## 活跃项目

{{#if projects}}
{{#each projects}}
- {{name}}: {{path}} ({{status}})
{{/each}}
{{else}}
No active projects detected.
{{/if}}

## 最近的记忆

{{#if recentMemories}}
{{#each recentMemories}}
- {{date}}: {{summary}}
{{/each}}
{{else}}
No recent memories.
{{/if}}

## 待办事项

{{#if todos}}
{{#each todos}}
- [{{status}}] {{task}}
{{/each}}
{{else}}
No pending todos.
{{/if}}

## 系统状态

- **OS**: {{system.os}}
- **Shell**: {{system.shell}}
- **Node**: {{system.nodeVersion}}
- **OpenClaw**: {{system.openclawVersion}}

## 环境变量

{{#if envVars}}
{{#each envVars}}
- {{name}}: {{value}}
{{/each}}
{{/if}}

## 加载的技能

{{#if skills}}
{{#each skills}}
- {{name}}: {{description}}
{{/each}}
{{/if}}

## 特殊配置

{{#if specialConfig}}
{{specialConfig}}
{{/if}}

---

*This section is dynamically generated at session start and updated throughout the conversation.*

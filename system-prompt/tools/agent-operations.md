# Agent Operations Guide

> Subagent 和多 Agent 协作指南
> 基于 Claude Code AgentTool 最佳实践

## Subagent 基础

### 什么是 Subagent

Subagent 是一个独立的 AI 会话，可以：
- 并行执行任务
- 隔离上下文
- 共享或独立缓存
- 通过消息通信

### 启动方式

**方式 1：快速任务 (run 模式)**
```
sessions_spawn 
  task:"Review this PR" 
  runtime:acp 
  mode:run
```

**方式 2：持续会话 (session 模式)**
```
sessions_spawn 
  task:"Build a feature" 
  runtime:acp 
  mode:session
```

**方式 3：后台执行**
```
sessions_spawn 
  task:"Long running analysis" 
  runtime:acp 
  mode:run 
  streamTo:parent
```

## Fork 语义

### 何时 Fork

**适合 Fork 的场景：**
- 研究任务（开放式探索）
- 实现需要多次编辑的工作
- 中间输出不需要保留在主上下文

**Fork 的优势：**
- 继承父级上下文
- 共享提示词缓存
- 轻量级（比新 agent 更便宜）

### Fork 最佳实践

**1. 命名规范**
```
# ✅ 好的命名
name: "ship-audit"
name: "migration-review"
name: "test-runner"

# ❌ 避免
name: "agent-1"
name: "sub-task"
```

**2. 提示词风格**
```
# ✅ 指令式（Fork 使用）
"Audit what's left before this branch can ship. 
Check: uncommitted changes, commits ahead of main, 
whether tests exist. Report a punch list."

# ✅ 简报式（新 Agent 使用）
"Review migration 0042_user_schema.sql for safety. 
Context: we're adding a NOT NULL column to a 50M-row table. 
Existing rows get a backfill default. Report: is this safe?"
```

**3. 不要偷看**
```
# ❌ 错误：读取中间输出
read path:fork-output.log

# ✅ 正确：等待完成通知
# 等待 subagent 完成后的消息
```

**4. 不要竞争**
```
# ❌ 错误：猜测结果
"The audit probably found..."

# ✅ 正确：报告状态
"Still waiting on the audit — should land shortly."
```

## 并行 Agent

### 何时使用并行

**适合并行的场景：**
- 代码审查（3个维度同时审查）
- 研究（多个方向并行探索）
- 测试（多个测试套件并行）

### 并行启动模式

**模式 1：同时启动**
```
# 在单条消息中启动多个 agent
sessions_spawn task:"Review code reuse" mode:run
sessions_spawn task:"Review code quality" mode:run  
sessions_spawn task:"Review efficiency" mode:run
```

**模式 2：协调器模式**
```
# 启动协调器，由它管理子 agent
sessions_spawn 
  task:"Coordinate code review" 
  mode:session
  # 协调器内部启动子 agent
```

### 结果聚合

**等待所有完成：**
```
# 使用 subagents 工具监控
subagents action:list
# 等待所有显示完成
```

**聚合输出：**
```
# 收集所有结果
# 去重和优先级排序
# 生成综合报告
```

## Agent 间通信

### 消息传递

**发送消息：**
```
sessions_send 
  sessionKey:agent-session-id 
  message:"Status update: 50% complete"
```

**广播消息：**
```
message 
  action:broadcast 
  targets:["agent1", "agent2"] 
  message:"Task completed"
```

### 状态共享

**通过文件共享：**
```
# Agent A 写入状态
write path:/tmp/agent-a-status.json content:'{"progress": 50}'

# Agent B 读取状态
read path:/tmp/agent-a-status.json
```

**通过消息共享：**
```
# Agent A 发送
sessions_send target:agent-b message:"Progress: 50%"

# Agent B 接收（在对话中）
```

## 常见模式

### 模式 1：代码审查
```
1. 获取代码变更（git diff）
2. 启动 3 个 review agent（并行）
   - Agent 1: 代码复用审查
   - Agent 2: 代码质量审查
   - Agent 3: 效率审查
3. 等待所有完成
4. 聚合结果
5. 应用修复
```

### 模式 2：研究任务
```
1. 启动多个探索 agent（并行）
   - Agent 1: 搜索方案 A
   - Agent 2: 搜索方案 B
   - Agent 3: 搜索方案 C
2. 收集所有发现
3. 综合比较
4. 生成报告
```

### 模式 3：批量处理
```
1. 分割任务列表
2. 为每个任务启动 agent
3. 监控进度
4. 收集结果
5. 合并输出
```

## 管理 Subagent

### 列出所有 Agent
```
subagents action:list
```

### 终止 Agent
```
subagents action:kill target:agent-session-id
```

### 发送指令
```
subagents action:steer 
  target:agent-session-id 
  message:"Change priority to P0"
```

### 查看日志
```
sessions_history 
  sessionKey:agent-session-id 
  limit:50
```

## 性能优化

### 缓存共享
- Fork 共享父级提示词缓存
- 不同 model 无法共享缓存
- 尽量使用相同 model

### 资源控制
- 限制并行 agent 数量
- 及时终止完成的 agent
- 监控 token 消耗

### 错误处理
- 设置超时
- 处理 agent 失败
- 有重试机制

## 安全考虑

### 权限隔离
- Subagent 继承父级权限
- 敏感操作仍需确认
- 不信任的代码在隔离环境运行

### 数据隔离
- 每个 agent 独立工作目录
- 敏感数据不共享
- 清理临时文件

## 故障排查

### Agent 无响应
```
1. 检查状态：subagents action:list
2. 查看日志：sessions_history
3. 必要时终止：subagents action:kill
```

### 结果不一致
```
1. 检查输入是否一致
2. 确认 agent 版本相同
3. 查看是否有随机性
```

### 性能问题
```
1. 减少并行数量
2. 检查网络延迟
3. 优化提示词长度
```

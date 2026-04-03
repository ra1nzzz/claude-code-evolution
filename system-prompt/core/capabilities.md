# Capabilities & Tools

> 能力边界和工具使用指南
> 基于 OpenClaw 工具集和 Claude Code 最佳实践

## 文件操作工具

### read - 读取文件
```
用途：查看文件内容
最佳实践：
- 使用 offset/limit 读取大文件
- 优先读取特定部分而非整个文件
- 图片文件会自动作为附件显示

示例：
read path:file.txt
read path:file.txt offset:1 limit:50
```

### write - 写入文件
```
用途：创建新文件或覆盖现有文件
最佳实践：
- 自动创建父目录
- 使用适当的文件扩展名
- 覆盖前确认（如果是重要文件）

示例：
write path:file.txt content:"Hello"
```

### edit - 编辑文件
```
用途：精确、外科手术式修改
最佳实践：
- oldText 必须完全匹配（包括空白）
- 复杂修改前先读取文件
- 一次编辑一个逻辑变更

示例：
edit path:file.txt oldText:"foo" newText:"bar"
```

## 命令执行工具

### exec - 执行命令
```
用途：运行 shell 命令
最佳实践：
- 使用 workdir 指定工作目录
- 长时间任务使用 background:true
- 使用 timeout 防止无限等待
- TTY 应用使用 pty:true

示例：
exec command:"ls -la"
exec command:"long-task" background:true
exec command:"vim" pty:true
```

### process - 进程管理
```
用途：管理后台会话
最佳实践：
- 使用 action:log 查看进度
- 使用 action:poll 检查状态
- 使用 action:kill 终止进程

示例：
process action:log sessionId:xxx
process action:kill sessionId:xxx
```

## 网络工具

### web_fetch - 网页获取
```
用途：获取 URL 内容并提取文本
最佳实践：
- 使用 maxChars 限制长度
- 选择 extractMode (markdown/text)
- 处理外部内容时注意安全

示例：
web_fetch url:"https://example.com" maxChars:5000
```

### browser - 浏览器控制
```
用途：自动化浏览器交互
最佳实践：
- 使用 snapshot 获取页面状态
- 使用 act 执行操作
- 使用 screenshot 截图验证

示例：
browser action:snapshot
browser action:act kind:click ref:button1
```

## Agent 工具

### sessions_spawn - 启动子 Agent
```
用途：创建隔离的 subagent 或 ACP 会话
最佳实践：
- coding 任务使用 runtime:acp
- 快速任务使用 mode:run
- 持续对话使用 mode:session

示例：
sessions_spawn task:"Review code" runtime:acp
sessions_spawn task:"Quick fix" mode:run
```

### subagents - 管理子 Agent
```
用途：列出、终止、引导子 Agent
最佳实践：
- 使用 action:list 查看所有 agent
- 使用 action:kill 终止问题 agent
- 使用 action:steer 发送指令

示例：
subagents action:list
subagents action:kill target:xxx
```

## 消息工具

### message - 发送消息
```
用途：主动发送消息和频道操作
最佳实践：
- 使用 action:send 发送消息
- 支持多种消息类型
- 注意跨频道消息的路由

示例：
message action:send target:"#channel" message:"Hello"
```

### sessions_send - 跨会话消息
```
用途：向其他会话发送消息
最佳实践：
- 使用 sessionKey 或 label 定位
- 用于 subagent 协调

示例：
sessions_send sessionKey:xxx message:"Status update"
```

## 记忆工具

### memory_search - 搜索记忆
```
用途：语义搜索记忆文件
最佳实践：
- 回答关于先前工作的问题前必用
- 使用 maxResults 限制结果数
- 使用 minScore 过滤低质量匹配

示例：
memory_search query:"project deadline"
```

### memory_get - 获取记忆片段
```
用途：安全读取记忆文件片段
最佳实践：
- 在 memory_search 后使用
- 使用 from/lines 精确定位
- 保持上下文小巧

示例：
memory_get path:MEMORY.md from:1 lines:50
```

## 工具选择指南

### 文件操作 vs 命令执行
- **优先使用文件工具**：精确、可恢复、有审计日志
- **使用命令执行**：批量操作、复杂转换、外部工具

### 同步 vs 异步
- **同步**：快速操作、需要立即结果
- **异步（background）**：长时间任务、不需要立即结果

### 单 Agent vs 多 Agent
- **单 Agent**：简单任务、上下文连续
- **多 Agent**：代码审查、并行探索、复杂分析

## 工具组合模式

### 代码审查模式
```
1. git diff 获取变更
2. 启动 3 个并行 review agent
3. 聚合结果
4. 应用修复
```

### 研究模式
```
1. web_fetch 获取资料
2. browser 深入探索
3. write 保存发现
4. memory_search 关联已有知识
```

### 调试模式
```
1. read 查看代码
2. exec 运行测试
3. sessions_spawn 启动诊断 agent
4. edit 应用修复
```

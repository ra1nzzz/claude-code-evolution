# Claude Code Evolution

> 基于 Claude Code 源码分析的 OpenClaw 增强包
> 
> [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
> [![OpenClaw](https://img.shields.io/badge/OpenClaw-Compatible-blue.svg)](https://openclaw.ai)

## 📖 简介

本项目是对 [Claude Code](https://github.com/ra1nzzz/claude-code-src) 源码的深度分析和汲取，将优秀的架构设计、提示词工程和技能系统迁移到 OpenClaw 平台。

**分析规模**: 1903 个文件，约 51.2 万行代码  
**源码仓库**: https://github.com/ra1nzzz/claude-code-src

## ✨ 核心特性

### Phase 1: 技能系统 (Skills)

4 个基于 Claude Code 的增强技能：

| 技能 | 功能 | 触发词 |
|------|------|--------|
| **claude-code-simplify** | 代码审查（3个并行 agent） | `/simplify`, `审查代码` |
| **claude-code-remember** | 记忆管理和整理 | `/remember`, `整理记忆` |
| **claude-code-verify** | 任务完成度验证 | `/verify`, `验证任务` |
| **claude-code-debug** | 系统化调试辅助 | `/debug`, `调试` |

### Phase 2: 系统提示词架构

分层系统提示词设计：

```
system-prompt/
├── core/                    # 核心身份（静态缓存）
│   ├── identity.md         # 人格定义
│   ├── safety.md           # 安全规则
│   └── capabilities.md     # 能力边界
├── tools/                   # 工具指导（静态缓存）
│   ├── file-operations.md  # 文件操作指南
│   └── agent-operations.md # Agent 协作指南
├── dynamic/                 # 动态内容（每会话更新）
│   └── session-context.md  # 会话上下文
└── implementations/         # TypeScript 实现
    ├── section-cache.ts    # Section 缓存
    ├── context-generator.ts # 上下文生成
    ├── agent-coordinator.ts # Agent 协调器
    └── memory-manager.ts   # 记忆管理器
```

### Phase 3: 高级功能实现

- **Section 缓存**: 减少 token 消耗，提升性能
- **动态上下文**: 自动生成会话特定上下文
- **Agent 协调器**: 并行 Agent 执行和结果聚合
- **记忆管理器**: 三层记忆架构（CLAUDE.md / CLAUDE.local.md / Auto-memory）

## 🚀 快速开始

### 一键安装

**Windows (PowerShell):**
```powershell
# 克隆仓库
git clone https://github.com/ra1nzzz/claude-code-evolution.git
cd claude-code-evolution

# 运行安装脚本
.\install.ps1

# 或使用参数
.\install.ps1 -Backup -Force
```

**Linux/macOS (Bash):**
```bash
# 克隆仓库
git clone https://github.com/ra1nzzz/claude-code-evolution.git
cd claude-code-evolution

# 运行安装脚本
chmod +x install.sh
./install.sh

# 或使用参数
./install.sh --backup --force
```

### 手动安装

1. 复制 `skills/` 目录到 `~/.stepclaw/skills/`
2. 复制 `system-prompt/` 目录到 `~/.stepclaw/workspace/`
3. 复制文档到 `~/.stepclaw/workspace/references/`

## 📚 文档

### 参考文档

- [Claude Code 提示词工程精华](references/claude-code-prompt-engineering.md) - 从源码中提取的最佳实践
- [OpenClaw 优化建议](references/openclaw-prompt-optimization.md) - 具体的改进建议和实施路线图
- [完整总结](CLAUDE_CODE_ABSORPTION_SUMMARY.md) - 项目完整总结

### 技能文档

每个技能都有详细的 SKILL.md：
- `skills/claude-code-simplify/SKILL.md`
- `skills/claude-code-remember/SKILL.md`
- `skills/claude-code-verify/SKILL.md`
- `skills/claude-code-debug/SKILL.md`

## 🏗️ 架构设计

### 从 Claude Code 汲取的核心设计

#### 1. 分层系统提示词

```
静态部分（跨会话缓存）
├── 核心身份
├── 安全规则
├── 工具指导
└── 技能定义

__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__

动态部分（每会话/每轮更新）
├── 会话上下文
├── 用户偏好
└── 最近记忆
```

#### 2. Agent 协作模式

**Fork 语义:**
- 适合独立任务（研究、实现）
- 共享父级缓存
- Don't peek, Don't race

**并行 Agent:**
- 代码审查（3个维度同时审查）
- 研究探索（多角度并行）
- 结果聚合

#### 3. 三层记忆架构

| 层级 | 文件 | 用途 |
|------|------|------|
| 项目级 | `CLAUDE.md` | 团队约定，所有贡献者共享 |
| 个人级 | `CLAUDE.local.md` | 个人偏好，仅当前用户 |
| 自动级 | `memory/auto-extracted.json` | 自动提取的工作记忆 |

## 💻 使用示例

### 代码审查

```
用户: /simplify

Agent: 启动代码审查...
      ├─ Agent 1: 代码复用审查
      ├─ Agent 2: 代码质量审查
      └─ Agent 3: 效率审查
      
      聚合结果:
      - 发现 2 处可复用代码
      - 发现 1 处质量改进点
      - 发现 1 处效率优化机会
      
      已应用修复。
```

### 记忆管理

```
用户: /remember

Agent: 记忆审查报告
      
      ## Promotions (3)
      1. "使用 bun 而非 npm" → CLAUDE.md
      2. "偏好简洁回复" → CLAUDE.local.md
      3. "API 路由使用 kebab-case" → CLAUDE.md
      
      ## Cleanup (2)
      1. 删除重复条目
      2. 更新过期约定
      
      请审阅并批准每项变更。
```

### 调试辅助

```
用户: /debug 登录按钮不工作

Agent: 开始系统化调试...
      
      Phase 1: 信息收集
      - 检查相关代码文件
      - 查看错误日志
      - 复现问题
      
      Phase 2: 根因分析
      - 发现事件监听器未绑定
      - 定位到初始化顺序问题
      
      Phase 3: 修复验证
      - 应用修复
      - 验证功能正常
      - 运行回归测试
```

## 🔧 开发

### TypeScript 实现

所有核心功能都有 TypeScript 实现：

```typescript
// 使用 Section 缓存
import { systemPromptCache } from './implementations'

systemPromptCache.registerSection(
  systemPromptSection('identity', () => loadIdentity())
)

// 并行 Agent 执行
import { createCodeReview } from './implementations'

const results = await createCodeReview(gitDiff)

// 记忆管理
import { reviewMemories } from './implementations'

const report = await reviewMemories()
```

### 文件结构

```
.
├── install.ps1              # Windows 安装脚本
├── install.sh               # Unix/Linux/macOS 安装脚本
├── README.md                # 本文件
├── CLAUDE_CODE_ABSORPTION_SUMMARY.md  # 完整总结
│
├── skills/                  # 技能定义
│   ├── claude-code-simplify/
│   ├── claude-code-remember/
│   ├── claude-code-verify/
│   └── claude-code-debug/
│
├── system-prompt/           # 系统提示词架构
│   ├── core/               # 核心定义
│   ├── tools/              # 工具指导
│   ├── dynamic/            # 动态内容
│   └── implementations/    # TypeScript 实现
│
└── references/             # 参考文档
    ├── claude-code-prompt-engineering.md
    └── openclaw-prompt-optimization.md
```

## 📊 性能提升

基于 Claude Code 设计实现的性能优化：

| 优化项 | 效果 |
|--------|------|
| Section 缓存 | 减少 30-50% 系统提示词 token |
| 并行 Agent | 代码审查速度提升 3x |
| 动态边界 | 支持跨用户缓存静态内容 |
| 记忆分层 | 减少重复记忆，提升检索效率 |

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Claude Code](https://github.com/ra1nzzz/claude-code-src) - 源码分析和汲取
- [Anthropic](https://www.anthropic.com) - Claude Code 开发团队
- [OpenClaw](https://openclaw.ai) - 开源 AI 助手平台

## 📞 联系

- 作者: @ra1nzzz
- 仓库: https://github.com/ra1nzzz/claude-code-evolution
- 问题: https://github.com/ra1nzzz/claude-code-evolution/issues

---

> **注意**: 本项目是对 Claude Code 源码的学习和汲取，所有实现均为独立开发，遵循开源最佳实践。

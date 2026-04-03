---
name: sumra-memory
description: |
  sumra.shop 记忆管理技能。系统性审查和整理 sumra.shop Agent 的记忆文件，
  包括 MEMORY.md、EXECUTION_PLAN.md、CREDENTIALS.md 的内容维护。
triggers:
  - 整理记忆
  - 记忆审查
  - 部署状态更新
  - 同步进度
---

# sumra Memory: 记忆审查与维护

## 目标

系统性审查 sumra.shop Agent 的记忆文件，保持内容最新、去除冗余、识别需要晋升到长期记忆的条目。

---

## 记忆文件清单

| 文件 | 内容 | 审查频率 |
|------|------|---------|
| `memory/MEMORY.md` | 网站定位、技术栈、域名/主机信息 | 每次部署后更新 |
| `EXECUTION_PLAN.md` | 部署执行计划（Phase 0-4） | 每次 Phase 完成后更新 |
| `CREDENTIALS.md` | 所有密码/密钥（加密存储） | 创建时即写入 |
| `DEPLOYMENT.md` | 部署文档 v1.0 | 稳定，不频繁更新 |

---

## 审查步骤

### 1. 读取所有记忆文件
```
- /Users/yitao/.openclaw/workspaces/sumra.shop/memory/MEMORY.md
- /Users/yitao/.openclaw/workspaces/sumra.shop/EXECUTION_PLAN.md
```

### 2. 检查项

**进度对齐检查：**
- EXECUTION_PLAN.md 的 Phase 完成状态是否与实际部署一致？
- MEMORY.md 中的主机 IP、域名、密码是否仍是最新的？
- CREDENTIALS.md 是否有新增密码需要记录？

**内容清理检查：**
- 过期的 TODO 项（已完成的 Phase 是否标记为 ✅？）
- 已废弃的方案（如最初的 BuckyDrop 方案 vs 现行的手动代发）
- 重复内容（同一信息是否出现在多个文件中？）

**新信息识别：**
- 最近的部署中学到了什么？（新增的坑、经验）
- 支付/供应链方案是否有变化需要更新？

### 3. 输出报告

```
## sumra.shop 记忆审查报告

### 🔄 需要更新的内容
- [文件: 具体位置] → 建议更新为：...

### 🗑️ 可删除的过期内容
- [位置] → 原因：...

### 📝 待写入的新记忆
- [内容] → 建议写入位置：...

### ⚠️ 需要人工确认
- [不确定的内容] → 请 韬哥 确认
```

---

## 行动规则

- **Present ALL proposals before making any changes**
- **Do NOT modify files without explicit user approval**（除非韬哥明确授权）
- **CREDENTIALS.md 永远不发送给任何人**，只做本地维护
- **更新前先备份**：任何修改都先 `cp FILE FILE.bak.YYYYMMDD`

## 使用

```
/remember  # 审查所有记忆文件
/remember quick  # 只检查进度对齐
```

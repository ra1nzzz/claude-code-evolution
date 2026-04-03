# Permission System

> 来源: `src/components/permissions/` — Claude Code 文件系统权限请求
> 整理: Lucy | 2026-04-04

---

## 设计概述

Claude Code 有完整的**文件系统权限系统**，在执行危险操作前请求用户授权。

### 核心文件

```
src/components/permissions/
├── FilesystemPermissionRequest/
│   └── FilesystemPermissionRequest.tsx
src/utils/permissions/
├── PermissionMode.js
├── filesystem.ts
└── prompt.ts
```

---

## 权限模式

```typescript
// src/utils/permissions/PermissionMode.js
const PERMISSION_MODES = ['read', 'write', 'bypass'] as const

type PermissionMode = typeof PERMISSION_MODES[number]

// read:   仅读取文件，不提示
// write:  写入文件前请求确认
// bypass: 完全绕过，silent 执行
```

---

## 权限请求组件

`FilesystemPermissionRequest.tsx` — React 组件，渲染权限请求 UI：

**请求类型：**
- 目录访问
- 多个文件写入
- 敏感路径访问

**用户选项：**
- 允许一次
- 拒绝
- 记住选择（可选）

---

## 权限缓存

```typescript
// 文件系统权限可以缓存，避免重复请求
// 缓存 key: 文件路径 + 操作类型 + 时间戳
```

---

## OpenClaw 适配建议

```typescript
// OpenClaw 应该实现：
// 1. 权限模式：read / write / bypass
// 2. 权限请求 UI
// 3. 权限缓存
// 4. 敏感路径识别（~/.ssh, /etc, 等）

interface PermissionRequest {
  type: 'filesystem'
  action: 'read' | 'write' | 'delete' | 'execute'
  path: string
  reason: string  // 为什么需要这个权限
}

// 权限检查钩子
function checkPermission(request: PermissionRequest): PermissionResult
```

---

## 参考源码

| 文件 | 作用 |
|------|------|
| `src/components/permissions/FilesystemPermissionRequest/FilesystemPermissionRequest.tsx` | 权限请求 UI |
| `src/utils/permissions/PermissionMode.js` | 权限模式定义 |
| `src/utils/permissions/filesystem.ts` | 文件系统权限逻辑 |

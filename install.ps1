#!/usr/bin/env pwsh
# Claude Code Evolution - One-Click Installer
# Based on Claude Code source analysis
# Repository: https://github.com/ra1nzzz/claude-code-src

param(
    [switch]$Force,
    [switch]$Backup,
    [string]$InstallPath = "$env:USERPROFILE\.stepclaw"
)

$ErrorActionPreference = "Stop"

# Colors
$Green = "`e[32m"
$Yellow = "`e[33m"
$Red = "`e[31m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-Status($message) {
    Write-Host "$Green[✓]$Reset $message"
}

function Write-Warning($message) {
    Write-Host "$Yellow[!]$Reset $message"
}

function Write-Error($message) {
    Write-Host "$Red[✗]$Reset $message"
}

function Write-Info($message) {
    Write-Host "$Blue[→]$Reset $message"
}

# Banner
Write-Host @"
$Blue
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Claude Code Evolution - OpenClaw Enhancement Pack          ║
║                                                               ║
║   Based on: https://github.com/ra1nzzz/claude-code-src       ║
║   Analysis: 1903 files, 512K+ lines of code                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
$Reset
"@

# Check prerequisites
Write-Info "Checking prerequisites..."

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed. Please install Git first."
    exit 1
}

if (-not (Test-Path $InstallPath)) {
    Write-Warning "OpenClaw not found at $InstallPath"
    Write-Info "Creating directory structure..."
    New-Item -ItemType Directory -Force -Path $InstallPath | Out-Null
}

$WorkspacePath = "$InstallPath\workspace"
$SkillsPath = "$InstallPath\skills"

# Backup existing configuration
if ($Backup -and (Test-Path $WorkspacePath)) {
    $BackupPath = "$InstallPath\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Info "Creating backup at $BackupPath..."
    Copy-Item -Recurse $WorkspacePath $BackupPath
    Write-Status "Backup created"
}

# Create directory structure
Write-Info "Creating directory structure..."
$Directories = @(
    "$WorkspacePath\references",
    "$WorkspacePath\system-prompt\core",
    "$WorkspacePath\system-prompt\tools",
    "$WorkspacePath\system-prompt\dynamic",
    "$WorkspacePath\system-prompt\implementations",
    "$SkillsPath\claude-code-simplify",
    "$SkillsPath\claude-code-remember",
    "$SkillsPath\claude-code-verify",
    "$SkillsPath\claude-code-debug"
)

foreach ($dir in $Directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}
Write-Status "Directory structure created"

# Copy skills
Write-Info "Installing skills..."
$Skills = @(
    @{ Name = "claude-code-simplify"; Description = "Code review and cleanup" },
    @{ Name = "claude-code-remember"; Description = "Memory management" },
    @{ Name = "claude-code-verify"; Description = "Task verification" },
    @{ Name = "claude-code-debug"; Description = "Debug assistance" }
)

foreach ($skill in $Skills) {
    $skillPath = "$PSScriptRoot\skills\$($skill.Name)\SKILL.md"
    $targetPath = "$SkillsPath\$($skill.Name)\SKILL.md"
    
    if (Test-Path $skillPath) {
        Copy-Item $skillPath $targetPath -Force
        Write-Status "Installed: $($skill.Name) - $($skill.Description)"
    } else {
        Write-Warning "Skill file not found: $skillPath"
    }
}

# Copy documentation
Write-Info "Installing documentation..."
$Docs = @(
    @{ Source = "references\claude-code-prompt-engineering.md"; Target = "$WorkspacePath\references\claude-code-prompt-engineering.md" },
    @{ Source = "references\openclaw-prompt-optimization.md"; Target = "$WorkspacePath\references\openclaw-prompt-optimization.md" },
    @{ Source = "CLAUDE_CODE_ABSORPTION_SUMMARY.md"; Target = "$WorkspacePath\CLAUDE_CODE_ABSORPTION_SUMMARY.md" }
)

foreach ($doc in $Docs) {
    $sourcePath = "$PSScriptRoot\$($doc.Source)"
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $doc.Target -Force
        Write-Status "Installed: $($doc.Source)"
    } else {
        Write-Warning "Document not found: $sourcePath"
    }
}

# Copy system prompt files
Write-Info "Installing system prompt architecture..."
$SystemPromptFiles = @(
    "system-prompt\README.md",
    "system-prompt\core\identity.md",
    "system-prompt\core\safety.md",
    "system-prompt\core\capabilities.md",
    "system-prompt\tools\file-operations.md",
    "system-prompt\tools\agent-operations.md",
    "system-prompt\dynamic\session-context.md"
)

foreach ($file in $SystemPromptFiles) {
    $sourcePath = "$PSScriptRoot\$file"
    $targetPath = "$WorkspacePath\$file"
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $targetPath -Force
        Write-Status "Installed: $file"
    } else {
        Write-Warning "File not found: $sourcePath"
    }
}

# Copy implementations
Write-Info "Installing TypeScript implementations..."
$Implementations = @(
    "system-prompt\implementations\index.ts",
    "system-prompt\implementations\section-cache.ts",
    "system-prompt\implementations\context-generator.ts",
    "system-prompt\implementations\agent-coordinator.ts",
    "system-prompt\implementations\memory-manager.ts"
)

foreach ($file in $Implementations) {
    $sourcePath = "$PSScriptRoot\$file"
    $targetPath = "$WorkspacePath\$file"
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $targetPath -Force
        Write-Status "Installed: $file"
    } else {
        Write-Warning "File not found: $sourcePath"
    }
}

# Update MEMORY.md
Write-Info "Updating MEMORY.md..."
$MemoryPath = "$WorkspacePath\MEMORY.md"
if (Test-Path $MemoryPath) {
    $MemoryContent = Get-Content $MemoryPath -Raw
    
    # Check if already has Claude Code section
    if (-not ($MemoryContent -match "Claude Code 源码分析")) {
        $ClaudeCodeSection = @"

## Claude Code 源码分析 (2026-04-03)
- **仓库**: ra1nzzz/claude-code-src (1903文件, 51.2万行代码)
- **分析内容**: 工具系统、Agent系统、Skill系统、提示词工程
- **汲取成果**:
  - **Phase 1**: 4个新 skills (simplify, remember, verify, debug)
  - **Phase 2**: 系统提示词架构 (core/tools/dynamic)
  - **Phase 3**: TypeScript 实现 (缓存/上下文/Agent/记忆)
  - 三层记忆架构 (CLAUDE.md / CLAUDE.local.md / Auto-memory)
  - 并行 Agent 启动模式
  - Fork 子代理语义
- **参考文档**: 
  - `references/claude-code-prompt-engineering.md`
  - `references/openclaw-prompt-optimization.md`
- **系统提示词**: `workspace/system-prompt/`
- **实现代码**: `workspace/system-prompt/implementations/*.ts`
- **总结文档**: `workspace/CLAUDE_CODE_ABSORPTION_SUMMARY.md`
"@
        Add-Content $MemoryPath $ClaudeCodeSection
        Write-Status "Updated MEMORY.md"
    } else {
        Write-Warning "MEMORY.md already contains Claude Code section"
    }
} else {
    Write-Warning "MEMORY.md not found"
}

# Create CLAUDE.md if not exists
$ClaudeMdPath = "$WorkspacePath\CLAUDE.md"
if (-not (Test-Path $ClaudeMdPath)) {
    Write-Info "Creating CLAUDE.md..."
    @"
# CLAUDE.md - Project Conventions

> This file contains project-wide conventions for Claude Code / OpenClaw
> All contributors should follow these guidelines.

## Code Style

- Use functional programming patterns where appropriate
- Prefer immutability
- Write self-documenting code
- Comments should explain WHY, not WHAT

## Tools

- Use dedicated tools instead of shell commands when available
- Prefer `read` over `cat`, `write` over `echo >`, `edit` over `sed`
- Use `sessions_spawn` for parallel tasks

## Memory

- Use `/remember` to review and organize memories
- Promote conventions to this file
- Keep personal preferences in CLAUDE.local.md

## Skills

Available skills:
- `/simplify` - Code review with parallel agents
- `/remember` - Memory management
- `/verify` - Task verification
- `/debug` - Debug assistance
"@ | Set-Content $ClaudeMdPath
    Write-Status "Created CLAUDE.md"
}

# Summary
Write-Host @"
$Green
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Installation Complete!                                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
$Reset

Installed Components:
  • 4 New Skills (simplify, remember, verify, debug)
  • System Prompt Architecture
  • TypeScript Implementations (~1400 lines)
  • Reference Documentation

Quick Start:
  1. Try: /simplify - Run code review
  2. Try: /remember - Review memories
  3. Try: /verify  - Verify task completion
  4. Try: /debug   - Debug assistance

Documentation:
  • $WorkspacePath\CLAUDE_CODE_ABSORPTION_SUMMARY.md
  • $WorkspacePath\references\
  • $WorkspacePath\system-prompt\

"@

Write-Status "Claude Code Evolution installed successfully!"

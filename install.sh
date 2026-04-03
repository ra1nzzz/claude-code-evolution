#!/bin/bash
# Claude Code Evolution - One-Click Installer (Unix/Linux/macOS)
# Based on Claude Code source analysis

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
status() { echo -e "${GREEN}[✓]${NC} $1"; }
warning() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }

# Banner
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Claude Code Evolution - OpenClaw Enhancement Pack          ║
║                                                               ║
║   Based on: https://github.com/ra1nzzz/claude-code-src       ║
║   Analysis: 1903 files, 512K+ lines of code                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF

# Parse arguments
INSTALL_PATH="${HOME}/.stepclaw"
BACKUP=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backup) BACKUP=true; shift ;;
        --force) FORCE=true; shift ;;
        --path) INSTALL_PATH="$2"; shift 2 ;;
        *) shift ;;
    esac
done

WORKSPACE_PATH="${INSTALL_PATH}/workspace"
SKILLS_PATH="${INSTALL_PATH}/skills"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check prerequisites
info "Checking prerequisites..."

if ! command -v git &> /dev/null; then
    error "Git is not installed. Please install Git first."
    exit 1
fi

if [ ! -d "$INSTALL_PATH" ]; then
    warning "OpenClaw not found at $INSTALL_PATH"
    info "Creating directory structure..."
    mkdir -p "$INSTALL_PATH"
fi

# Backup existing configuration
if [ "$BACKUP" = true ] && [ -d "$WORKSPACE_PATH" ]; then
    BACKUP_PATH="${INSTALL_PATH}/backup-$(date +%Y%m%d-%H%M%S)"
    info "Creating backup at $BACKUP_PATH..."
    cp -r "$WORKSPACE_PATH" "$BACKUP_PATH"
    status "Backup created"
fi

# Create directory structure
info "Creating directory structure..."
mkdir -p "$WORKSPACE_PATH"/references
mkdir -p "$WORKSPACE_PATH"/system-prompt/{core,tools,dynamic,implementations}
mkdir -p "$SKILLS_PATH"/claude-code-{simplify,remember,verify,debug}
status "Directory structure created"

# Copy skills
info "Installing skills..."
SKILLS=(
    "claude-code-simplify:Code review and cleanup"
    "claude-code-remember:Memory management"
    "claude-code-verify:Task verification"
    "claude-code-debug:Debug assistance"
)

for skill_info in "${SKILLS[@]}"; do
    IFS=':' read -r skill_name skill_desc <<< "$skill_info"
    skill_src="${SCRIPT_DIR}/skills/${skill_name}/SKILL.md"
    skill_dst="${SKILLS_PATH}/${skill_name}/SKILL.md"
    
    if [ -f "$skill_src" ]; then
        cp "$skill_src" "$skill_dst"
        status "Installed: $skill_name - $skill_desc"
    else
        warning "Skill file not found: $skill_src"
    fi
done

# Copy documentation
info "Installing documentation..."
DOCS=(
    "references/claude-code-prompt-engineering.md"
    "references/openclaw-prompt-optimization.md"
    "CLAUDE_CODE_ABSORPTION_SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
    src="${SCRIPT_DIR}/${doc}"
    dst="${WORKSPACE_PATH}/${doc}"
    if [ -f "$src" ]; then
        cp "$src" "$dst"
        status "Installed: $doc"
    else
        warning "Document not found: $src"
    fi
done

# Copy system prompt files
info "Installing system prompt architecture..."
SYSTEM_FILES=(
    "system-prompt/README.md"
    "system-prompt/core/identity.md"
    "system-prompt/core/safety.md"
    "system-prompt/core/capabilities.md"
    "system-prompt/tools/file-operations.md"
    "system-prompt/tools/agent-operations.md"
    "system-prompt/dynamic/session-context.md"
)

for file in "${SYSTEM_FILES[@]}"; do
    src="${SCRIPT_DIR}/${file}"
    dst="${WORKSPACE_PATH}/${file}"
    if [ -f "$src" ]; then
        mkdir -p "$(dirname "$dst")"
        cp "$src" "$dst"
        status "Installed: $file"
    else
        warning "File not found: $src"
    fi
done

# Copy implementations
info "Installing TypeScript implementations..."
IMPL_FILES=(
    "system-prompt/implementations/index.ts"
    "system-prompt/implementations/section-cache.ts"
    "system-prompt/implementations/context-generator.ts"
    "system-prompt/implementations/agent-coordinator.ts"
    "system-prompt/implementations/memory-manager.ts"
)

for file in "${IMPL_FILES[@]}"; do
    src="${SCRIPT_DIR}/${file}"
    dst="${WORKSPACE_PATH}/${file}"
    if [ -f "$src" ]; then
        mkdir -p "$(dirname "$dst")"
        cp "$src" "$dst"
        status "Installed: $file"
    else
        warning "File not found: $src"
    fi
done

# Update MEMORY.md
info "Updating MEMORY.md..."
MEMORY_PATH="${WORKSPACE_PATH}/MEMORY.md"
if [ -f "$MEMORY_PATH" ]; then
    if ! grep -q "Claude Code 源码分析" "$MEMORY_PATH"; then
        cat >> "$MEMORY_PATH" << 'EOF'

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
EOF
        status "Updated MEMORY.md"
    else
        warning "MEMORY.md already contains Claude Code section"
    fi
else
    warning "MEMORY.md not found"
fi

# Create CLAUDE.md if not exists
CLAUDE_MD_PATH="${WORKSPACE_PATH}/CLAUDE.md"
if [ ! -f "$CLAUDE_MD_PATH" ]; then
    info "Creating CLAUDE.md..."
    cat > "$CLAUDE_MD_PATH" << 'EOF'
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
EOF
    status "Created CLAUDE.md"
fi

# Summary
cat << EOF

${GREEN}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Installation Complete!                                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${NC}

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
  • ${WORKSPACE_PATH}/CLAUDE_CODE_ABSORPTION_SUMMARY.md
  • ${WORKSPACE_PATH}/references/
  • ${WORKSPACE_PATH}/system-prompt/

EOF

status "Claude Code Evolution installed successfully!"

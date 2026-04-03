---
name: claude-code-debug
description: |
  调试辅助技能。基于 Claude Code 的 debug 命令，
  系统化地帮助用户诊断和修复代码问题。
triggers:
  - /debug
  - 调试
  - 排查问题
  - troubleshoot
  - 修复 bug
---

# Debug: 系统化调试辅助

Help diagnose and fix issues systematically. Use this skill when:
- User reports a bug or unexpected behavior
- Tests are failing
- Something "doesn't work" but the cause is unclear

## Debug Process

### Phase 1: Information Gathering

1. **Understand the symptom**
   - What exactly is happening vs. what should happen?
   - When did it start occurring?
   - What changed recently?

2. **Gather context**
   - Read relevant code files
   - Check recent git history
   - Review error messages or logs
   - Look at test failures if applicable

3. **Reproduce the issue**
   - Create a minimal reproduction case if possible
   - Identify the exact steps that trigger the problem

### Phase 2: Root Cause Analysis

1. **Form hypotheses**
   - What could cause this symptom?
   - Consider: logic errors, state issues, async problems, configuration, dependencies

2. **Test hypotheses**
   - Add logging/debugging to verify assumptions
   - Check intermediate values
   - Trace execution flow

3. **Isolate the cause**
   - Narrow down to the specific line/function/component
   - Identify the exact condition that triggers the bug

### Phase 3: Fix and Verify

1. **Implement the fix**
   - Make the minimal change needed
   - Ensure the fix addresses the root cause, not just the symptom

2. **Verify the fix**
   - Confirm the issue is resolved
   - Run tests to ensure no regressions
   - Check edge cases

3. **Document learnings** (optional)
   - If this was a tricky bug, consider adding a comment explaining the fix
   - Update relevant documentation

## Debug Strategies by Symptom Type

### "It crashes/errors"
- Get the full error message and stack trace
- Identify the exact line where it fails
- Check for null/undefined values
- Verify function arguments and return types

### "It produces wrong output"
- Trace the data flow from input to output
- Add logging at key transformation points
- Check for off-by-one errors, boundary conditions
- Verify assumptions about data format

### "It's slow"
- Profile to identify bottlenecks
- Check for unnecessary re-renders or re-computations
- Look for N+1 query patterns
- Verify caching is working

### "It works on my machine"
- Check environment differences
- Verify dependencies versions
- Check configuration files
- Look for hardcoded paths or assumptions

### "It works sometimes"
- Look for race conditions
- Check async/await usage
- Verify state management
- Check for timing-dependent logic

## Usage

```
/debug [problem description]
```

## Examples

- `/debug` - 开始调试当前上下文中的问题
- `/debug login button not working` - 调试特定问题
- `/debug test failure in auth module` - 调试测试失败
- `帮我调试这个错误` - 触发调试流程

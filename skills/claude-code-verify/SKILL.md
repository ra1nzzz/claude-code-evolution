---
name: claude-code-verify
description: |
  任务验证技能。基于 Claude Code 的 verify 命令，
  验证任务完成度，确保代码正确实现并经过测试。
triggers:
  - /verify
  - 验证任务
  - 检查完成度
  - verify task
  - 确认完成
---

# Verify: 任务完成度验证

Verify that a task has been completed correctly. Use this skill when you want to ensure:
1. The implementation matches the requirements
2. Tests pass (if applicable)
3. No regressions were introduced
4. Code quality standards are met

## Verification Checklist

### 1. Requirements Verification
- [ ] Re-read the original task requirements
- [ ] Check that all requirements are addressed
- [ ] Verify edge cases are handled
- [ ] Confirm no scope creep or missing features

### 2. Implementation Review
- [ ] Review the actual code changes
- [ ] Check for obvious bugs or logic errors
- [ ] Verify error handling is appropriate
- [ ] Ensure type safety (if using TypeScript)

### 3. Testing Verification
- [ ] Run existing tests to check for regressions
- [ ] Verify new functionality is tested (if tests exist)
- [ ] Check test coverage for critical paths
- [ ] Run linting/type checking if configured

### 4. Integration Check
- [ ] Verify the changes integrate with existing code
- [ ] Check for breaking changes
- [ ] Ensure configuration files are updated if needed
- [ ] Verify documentation is updated (if applicable)

## Verification Process

1. **Gather Context**: Review the task description and implementation
2. **Execute Checks**: Run through the checklist above
3. **Report Findings**: Present a clear summary of:
   - ✅ What's verified and working
   - ⚠️ Potential issues or concerns
   - ❌ Blockers or failures that need fixing

## Output Format

```
## Verification Report: [Task Name]

### ✅ Passed
- [List of verified items]

### ⚠️ Warnings
- [Potential issues that may need attention]

### ❌ Blockers
- [Critical issues that must be fixed]

### Summary
[Overall assessment and next steps]
```

## Usage

```
/verify [task description or scope]
```

## Examples

- `/verify` - 验证最近完成的任务
- `/verify the login feature` - 验证特定功能
- `请验证这个实现是否正确` - 触发验证流程

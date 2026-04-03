# File Operations Guide

> 文件操作工具的标准使用指南
> 基于 Claude Code 最佳实践

## 读取文件 (read)

### 基本原则
- **优先读取而非猜测** - 不要假设文件内容
- **增量读取大文件** - 使用 offset/limit
- **读取相关上下文** - 修改前了解周围代码

### 使用场景

**场景 1：查看小文件**
```
read path:config.json
```

**场景 2：查看大文件的开头**
```
read path:large-file.ts limit:50
```

**场景 3：查看特定部分**
```
read path:large-file.ts offset:100 limit:50
```

**场景 4：读取图片**
```
read path:image.png
# 图片会自动作为附件显示
```

### 最佳实践

1. **先读后改**
   ```
   # ❌ 错误：直接编辑
   edit path:file.ts oldText:"..." newText:"..."
   
   # ✅ 正确：先读取
   read path:file.ts
   # ... 理解内容后编辑
   edit path:file.ts oldText:"..." newText:"..."
   ```

2. **分批读取大文件**
   ```
   read path:file.ts limit:100          # 第 1-100 行
   read path:file.ts offset:101 limit:100  # 第 101-200 行
   ```

3. **读取相关文件**
   ```
   # 修改前先读取相关文件
   read path:types.ts      # 类型定义
   read path:utils.ts      # 工具函数
   read path:component.tsx # 组件实现
   ```

## 写入文件 (write)

### 基本原则
- **自动创建目录** - 无需手动 mkdir
- **覆盖警告** - 重要文件覆盖前确认
- **适当扩展名** - 使用正确的文件类型

### 使用场景

**场景 1：创建新文件**
```
write path:src/utils/helper.ts content:"export function helper() {}"
```

**场景 2：创建配置文件**
```
write path:config.json content:'{"key": "value"}'
```

**场景 3：创建文档**
```
write path:docs/guide.md content:"# Guide\n\nContent here"
```

### 最佳实践

1. **优先编辑而非覆盖**
   ```
   # ❌ 避免：完全覆盖
   write path:file.ts content:"..."
   
   # ✅ 更好：精确编辑
   edit path:file.ts oldText:"..." newText:"..."
   ```

2. **使用多行内容**
   ```
   write path:file.ts content:'''
   import { foo } from './foo'
   
   export function bar() {
     return foo()
   }
   '''
   ```

## 编辑文件 (edit)

### 基本原则
- **精确匹配** - oldText 必须完全匹配（包括空白）
- **外科手术式** - 一次只改一个地方
- **验证结果** - 编辑后读取确认

### 使用场景

**场景 1：简单替换**
```
edit path:file.ts oldText:"const x = 1" newText:"const x = 2"
```

**场景 2：多行替换**
```
edit path:file.ts 
  oldText:"function old() {\n  return 1\n}" 
  newText:"function new() {\n  return 2\n}"
```

**场景 3：添加内容**
```
edit path:file.ts 
  oldText:"// End of file" 
  newText:"// End of file\n\nexport const newConst = {}"
```

### 常见错误

1. **空白不匹配**
   ```
   # ❌ 错误：空格数量不匹配
   edit path:file.ts oldText:"  const x" newText:"const x"
   
   # ✅ 正确：完全匹配
   edit path:file.ts oldText:"  const x" newText:"  const y"
   ```

2. **换行符不匹配**
   ```
   # ❌ 错误：忽略换行
   edit path:file.ts oldText:"line1" newText:"line1\nline2"
   
   # ✅ 正确：包含换行
   edit path:file.ts oldText:"line1\n" newText:"line1\nline2\n"
   ```

3. **特殊字符未转义**
   ```
   # ❌ 错误：未转义引号
   edit path:file.ts oldText:""" newText:"'"
   
   # ✅ 正确：使用三引号包裹
   edit path:file.ts oldText:'''"''' newText:"'"
   ```

## 文件操作工作流

### 工作流 1：安全编辑
```
1. read path:file.ts              # 读取文件
2. # 理解内容，确定修改
3. edit path:file.ts oldText:"..." newText:"..."  # 精确编辑
4. read path:file.ts              # 验证修改
```

### 工作流 2：批量修改
```
1. read path:file1.ts             # 读取第一个文件
2. read path:file2.ts             # 读取第二个文件
3. # 分析共同模式
4. edit path:file1.ts oldText:"..." newText:"..."
5. edit path:file2.ts oldText:"..." newText:"..."
6. # 启动 subagent 并行处理更多文件
```

### 工作流 3：创建新功能
```
1. read path:existing.ts          # 了解现有代码
2. write path:new-feature.ts content:"..."  # 创建新文件
3. edit path:index.ts oldText:"..." newText:"..."  # 更新导出
4. exec command:"npm test"        # 运行测试
```

## 安全提示

### 破坏性操作
- **删除前确认** - 使用 trash 而非 rm
- **备份重要文件** - 编辑前复制
- **验证修改** - 编辑后读取确认

### 批量操作
- **先小规模测试** - 单个文件验证
- **使用 subagent** - 并行处理大量文件
- **记录变更** - 便于回滚

## 与命令行工具对比

| 任务 | 推荐工具 | 不推荐 |
|------|---------|--------|
| 查看文件内容 | read | cat, head, tail |
| 创建文件 | write | echo > file |
| 编辑文件 | edit | sed, awk |
| 批量查找 | exec + find/grep | 手动遍历 |
| 复杂转换 | exec + 脚本 | 多次 edit |

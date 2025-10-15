# Tauri 下载功能调试指南

## 问题现象

Tauri 环境下点击"下载为 Word 文档"按钮,没有弹出保存对话框。

## 已实施的修复

### 1. 添加 Rust 依赖

`src-tauri/Cargo.toml`:

```toml
tauri-plugin-dialog = "2.4"
tauri-plugin-fs = "2.4"
```

### 2. 注册插件

`src-tauri/src/lib.rs`:

```rust
.plugin(tauri_plugin_dialog::init())
.plugin(tauri_plugin_fs::init())
```

### 3. 配置权限

`src-tauri/capabilities/default.json`:

```json
{
  "permissions": ["core:default", "dialog:allow-save", "fs:allow-write-file"]
}
```

### 4. 前端实现

`app/utils/contentUtils.ts` - `downloadAsDocx` 函数:

- 检测 Tauri 环境
- 使用 `@tauri-apps/plugin-dialog` 的 `save()` 打开保存对话框
- 使用 `@tauri-apps/plugin-fs` 的 `writeFile()` 写入文件
- 添加详细的 console.log 用于调试

## 测试步骤

### 1. 重新启动 Tauri 开发模式

```powershell
# 停止当前运行的 tauri:dev (Ctrl+C)
# 重新运行
npm run tauri:dev
```

### 2. 生成文章

1. 输入关键词
2. 点击"生成文章"
3. 等待文章生成完成

### 3. 测试下载功能

1. 点击"下载为 Word 文档"按钮(Download 图标)
2. **打开浏览器开发者工具** (F12)
3. 查看 Console 标签页的日志

### 4. 预期行为

#### 成功情况 - Console 日志:

```
[Download] Is Tauri environment: true
[Tauri Download] Starting Tauri download process
[Tauri Download] Opening save dialog with filename: 文章标题_1234567890.docx
[Tauri Download] User selected path: C:\Users\...\文章标题.docx
[Tauri Download] Writing file, size: 12345 bytes
[Tauri Download] File written successfully
```

应该弹出 Windows 保存对话框,选择位置后文件会被保存。

#### 用户取消 - Console 日志:

```
[Download] Is Tauri environment: true
[Tauri Download] Starting Tauri download process
[Tauri Download] Opening save dialog with filename: 文章标题_1234567890.docx
[Tauri Download] User selected path: null
[Tauri Download] User cancelled save dialog
```

#### 错误情况 - Console 日志:

```
[Download] Is Tauri environment: true
[Tauri Download] Starting Tauri download process
Failed to download as docx: Error: ...
```

## 可能的问题排查

### 问题 1: `[Download] Is Tauri environment: false`

**原因**: 不在 Tauri 环境中运行
**解决**: 确保使用 `npm run tauri:dev` 而不是 `npm run dev`

### 问题 2: 权限错误

**错误信息**: `Permission denied` 或 `Command not allowed`
**解决**:

1. 检查 `src-tauri/capabilities/default.json` 权限配置
2. 重新构建: `cargo clean --manifest-path src-tauri/Cargo.toml`
3. 重新运行: `npm run tauri:dev`

### 问题 3: 模块导入失败

**错误信息**: `Cannot find module '@tauri-apps/plugin-dialog'`
**解决**:

```powershell
npm install @tauri-apps/plugin-dialog @tauri-apps/plugin-fs
```

### 问题 4: 对话框不显示

**可能原因**:

1. 权限未正确配置
2. Tauri 插件未正确注册
3. 前端代码异常中断

**解决步骤**:

1. 查看 Console 日志确定执行到哪一步
2. 查看 Rust 日志 (终端输出)
3. 检查是否有 JavaScript 错误

## 验证插件是否正确安装

### 检查前端包

```powershell
npm list @tauri-apps/plugin-dialog
npm list @tauri-apps/plugin-fs
```

应该显示版本号,如:

```
@tauri-apps/plugin-dialog@2.4.0
@tauri-apps/plugin-fs@2.4.x
```

### 检查 Rust 依赖

```powershell
cargo tree --manifest-path src-tauri/Cargo.toml | Select-String "tauri-plugin"
```

应该包含:

```
tauri-plugin-dialog v2.4.0
tauri-plugin-fs v2.4.x
```

## 对比测试

### 浏览器环境 (npm run dev)

1. 运行 `npm run dev`
2. 打开 http://localhost:3101
3. 生成文章后点击下载
4. 应该直接触发浏览器下载 (file-saver)

### Tauri 环境 (npm run tauri:dev)

1. 运行 `npm run tauri:dev`
2. Tauri 窗口自动打开
3. 生成文章后点击下载
4. 应该弹出 Windows 保存对话框

## 报告问题

如果问题持续存在,请提供:

1. Console 完整日志 (从点击下载开始)
2. 终端 Rust 日志
3. 是否有任何错误提示
4. `[Download] Is Tauri environment:` 的值
5. Tauri 版本: 在终端运行 `npm run tauri --version`

# Tauri 下载功能错误修复

## 错误信息

```
GET /_next/internal/helpers.ts 404 in 1505ms
[tao::platform_impl::platform::event_loop::runner][WARN] NewEvents emitted without explicit RedrawEventsCleared
```

## 问题原因

在 Tauri + Next.js 环境中,直接在代码中使用动态 `import()` 导入 Tauri 插件会导致 Next.js 尝试在服务端或构建时加载这些模块,从而产生 404 错误。

**原始错误代码**:

```typescript
// ❌ 这会导致 Next.js 尝试加载不存在的模块
const { save } = await import("@tauri-apps/plugin-dialog");
const { writeFile } = await import("@tauri-apps/plugin-fs");
```

## 解决方案

创建一个条件导入包装模块,只在 Tauri 环境中执行导入,在浏览器环境中返回 null。

### 1. 创建 `tauriImports.ts` 包装模块

```typescript
// app/utils/tauriImports.ts
export const isTauriEnvironment = (): boolean => {
  return typeof window !== "undefined" && "__TAURI__" in window;
};

export const getTauriDialog = async () => {
  if (!isTauriEnvironment()) {
    return null;
  }
  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    return { save };
  } catch (error) {
    console.error("[Tauri] Failed to load dialog plugin:", error);
    return null;
  }
};

export const getTauriFs = async () => {
  if (!isTauriEnvironment()) {
    return null;
  }
  try {
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    return { writeFile };
  } catch (error) {
    console.error("[Tauri] Failed to load fs plugin:", error);
    return null;
  }
};
```

### 2. 更新 `contentUtils.ts`

```typescript
// 导入包装函数
import { getTauriDialog, getTauriFs } from "./tauriImports";

// 在函数中使用
if (isTauriEnv) {
  // 动态加载 Tauri 插件
  const dialogPlugin = await getTauriDialog();
  const fsPlugin = await getTauriFs();

  if (!dialogPlugin || !fsPlugin) {
    throw new Error("Failed to load Tauri plugins");
  }

  const { save } = dialogPlugin;
  const { writeFile } = fsPlugin;

  // 使用 save 和 writeFile...
}
```

## 修改文件

1. **新增文件**:

   - `app/utils/tauriImports.ts` - Tauri 插件条件导入包装

2. **修改文件**:
   - `app/utils/contentUtils.ts` - 使用条件导入包装

## 工作原理

1. **环境检测**: 先检查是否在 Tauri 环境 (`"__TAURI__" in window`)
2. **条件导入**: 只在 Tauri 环境中执行 `import()`,避免在浏览器环境中尝试加载
3. **错误处理**: 如果导入失败,返回 null 并记录错误
4. **延迟加载**: 动态导入只在需要时执行,不会在模块加载时触发

## 测试步骤

### 1. 停止当前运行

```powershell
# 按 Ctrl+C 停止
```

### 2. 重新启动 Tauri

```powershell
npm run tauri:dev
```

### 3. 测试下载功能

1. 生成文章
2. 打开开发者工具 (F12)
3. 点击"下载为 Word 文档"按钮
4. 查看 Console 输出

### 4. 预期结果

**成功情况** - Console 输出:

```
[Download] Is Tauri environment: true
[Tauri Download] Starting Tauri download process
[Tauri Download] Opening save dialog with filename: xxx.docx
[Tauri Download] User selected path: C:\...\xxx.docx
[Tauri Download] Writing file, size: xxxxx bytes
[Tauri Download] File written successfully
```

**不应该再出现的错误**:

```
❌ GET /_next/internal/helpers.ts 404
❌ Cannot find module '@tauri-apps/plugin-dialog'
```

## 为什么这个方案有效

### 问题分析

- Next.js 在构建时会分析所有的 `import` 语句
- 动态 `import()` 虽然是运行时执行,但 Next.js 仍会尝试解析模块路径
- Tauri 插件只存在于 Tauri 环境,在浏览器/Node.js 环境中不存在

### 解决思路

- 将动态导入封装在函数中
- 函数内部先检查环境,再决定是否导入
- 使用 try-catch 捕获导入失败的情况
- 返回 null 而不是抛出错误,让调用方处理

### 优势

- ✅ 不会触发 Next.js 的 404 错误
- ✅ 浏览器环境和 Tauri 环境都能正常工作
- ✅ 错误处理清晰,有详细的日志
- ✅ 类型安全,有明确的返回值检查

## 浏览器环境兼容性

在浏览器环境 (`npm run dev`) 下:

- `getTauriDialog()` 返回 `null`
- `getTauriFs()` 返回 `null`
- `isTauriEnv` 为 `false`
- 代码会走到 `else` 分支,使用 `file-saver` 的 `saveAs()`
- ✅ 下载功能正常工作

在 Tauri 环境 (`npm run tauri:dev`) 下:

- `getTauriDialog()` 返回 `{ save }`
- `getTauriFs()` 返回 `{ writeFile }`
- `isTauriEnv` 为 `true`
- 使用 Tauri 的保存对话框和文件写入
- ✅ 下载功能正常工作

## 相关资料

- [Tauri Plugin API](https://v2.tauri.app/plugin/)
- [Next.js Dynamic Import](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#nextdynamic)
- [Conditional Imports in TypeScript](https://www.typescriptlang.org/docs/handbook/modules.html#dynamic-imports)

## 总结

通过创建条件导入包装,我们成功解决了 Tauri + Next.js 环境中动态导入插件导致的 404 错误。现在代码可以在浏览器和 Tauri 环境中无缝切换,不会产生任何错误。

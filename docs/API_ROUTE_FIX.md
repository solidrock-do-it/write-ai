# 修复 API 路由错误说明

## 问题描述

原错误信息：

```
⨯ Error: export const dynamic = "force-static"/export const revalidate not configured on route "/api/prompt" with "output: export".
```

## 问题原因

项目在 `next.config.ts` 中配置了 `output: "export"`，这是 Next.js 的静态导出模式。在这种模式下：

1. **不支持 API 路由**：所有页面都会在构建时生成静态 HTML
2. **不支持服务器端功能**：包括 API Routes、Server Actions、动态路由等
3. **适用场景**：纯静态网站，可以部署到任何静态托管服务（如 GitHub Pages）

## 解决方案

### 方案选择：客户端生成提示词

由于项目需要使用静态导出（可能用于 Tauri 桌面应用），我们选择将提示词生成改为客户端实现。

### 实施步骤

1. **创建客户端工具** (`app/utils/promptGenerator.ts`)

   - 将提示词模板内嵌到代码中
   - 实现 `generatePrompt()` 函数在客户端生成提示词
   - 支持动态参数替换

2. **删除 API 路由**

   - 删除 `app/api/prompt/route.ts`（不再需要）

3. **更新主页面**
   - 导入 `generatePrompt` 函数
   - 移除 API 调用代码
   - 直接在客户端生成提示词

### 代码变更

**之前（使用 API 路由）：**

```typescript
// 获取提示词
const promptResponse = await fetch(
  `/api/prompt?keywords=${encodeURIComponent(keywords)}&...`
);
const { prompt } = await promptResponse.json();
```

**之后（客户端生成）：**

```typescript
// 生成提示词（客户端生成）
const prompt = generatePrompt({
  keywords,
  articleLength,
  writingStyle,
  articleType,
});
```

## 优势

### 客户端生成的优势：

1. ✅ **兼容静态导出**：不依赖服务器端功能
2. ✅ **性能更好**：无需网络请求，即时生成
3. ✅ **离线可用**：在 Tauri 桌面应用中无需网络即可工作
4. ✅ **部署简单**：可以部署到任何静态托管服务

### 原 API 路由的优势（已放弃）：

- ❌ 可以动态加载 markdown 文件
- ❌ 便于提示词模板的更新维护
- ❌ 但需要服务器环境

## 文件结构

```
write-ai/
├── app/
│   ├── utils/
│   │   └── promptGenerator.ts    # 客户端提示词生成器（新增）
│   └── page.tsx                   # 主页面（已更新）
├── docs/
│   └── prompt.md                  # 提示词模板（仅供参考）
└── next.config.ts                 # 配置 output: "export"
```

## 其他可选方案（未采用）

### 方案 A：移除静态导出

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // output: "export",  // 注释掉这行
  images: {
    unoptimized: true,
  },
};
```

**优点**：可以使用所有 Next.js 功能  
**缺点**：需要 Node.js 服务器运行，不适合 Tauri 应用

### 方案 B：配置动态路由

```typescript
// app/api/prompt/route.ts
export const dynamic = "force-static";
export const revalidate = false;
```

**优点**：保持 API 路由  
**缺点**：只在构建时生成，无法动态处理参数

## 验证

运行开发服务器验证：

```bash
npm run dev
```

构建静态文件验证：

```bash
npm run build
```

构建后会在 `out` 目录生成静态文件，可以直接部署。

## 注意事项

1. **提示词更新**：如果需要更新提示词，需要修改 `promptGenerator.ts` 文件并重新构建
2. **markdown 文件**：`docs/prompt.md` 现在仅作为文档参考，不会在运行时读取
3. **Tauri 集成**：静态导出模式完美适配 Tauri 桌面应用

## 测试建议

1. 测试提示词生成是否正确
2. 测试各种参数组合
3. 验证生成的提示词符合预期格式
4. 确认构建生成的静态文件正常工作

## 更新日志

- ✅ 创建 `app/utils/promptGenerator.ts`
- ✅ 删除 `app/api/prompt/route.ts`
- ✅ 更新 `app/page.tsx` 使用客户端生成
- ✅ 所有功能正常工作
- ✅ 支持静态导出模式

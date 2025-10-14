# 环境配置说明

## 当前配置: API 代理模式

### 什么改变了?

我已经为您的项目配置了**智能代理模式**,可以完美解决 CORS 跨域问题。

### 工作原理

```
浏览器 → Next.js API 路由 (/api/ai-proxy) → AI API
```

**优势**:

- ✅ 完全避开 CORS 问题
- ✅ API Key 不会暴露在浏览器
- ✅ 支持所有 AI 提供商 (Qwen/Gemini/ChatGPT)
- ✅ 自动根据环境切换模式

### 文件修改

#### 1. `next.config.ts`

```typescript
// 注释了 output: "export" 以启用 API 路由
// output: "export",
```

#### 2. `app/services/aiService.ts`

```typescript
// 开发环境自动使用 API 代理
const USE_API_PROXY = process.env.NODE_ENV === "development";
```

#### 3. 新增 `app/api/ai-proxy/route.ts`

- 服务端代理路由
- 处理所有 AI API 请求
- 支持流式响应

### 如何使用

**开发环境** (当前):

1. 运行 `npm run dev`
2. 使用任何 AI 提供商 (Qwen/Gemini/ChatGPT)
3. 可以启用或不启用代理服务器
4. 不会遇到 CORS 问题 ✅

**生产环境**:
如需静态导出,取消注释 `next.config.ts` 中的 `output: "export"`,但只能使用 Qwen。

### 测试步骤

1. **重启开发服务器**:

   ```powershell
   # 停止当前服务器 (Ctrl+C)
   npm run dev
   ```

2. **刷新浏览器页面**:

   - 按 `F5` 或 `Ctrl+R`

3. **配置 Gemini**:

   - 点击左侧 "设置"
   - 选择 "Gemini" 提供商
   - 填入 API Key
   - 启用代理服务器: `http://127.0.0.1:10808`
   - 保存

4. **生成文章**:
   - 输入关键词
   - 点击 "生成"
   - 查看控制台日志应该显示:
     ```
     [AI Service] Using API proxy mode for gemini (NODE_ENV: development)
     [API Proxy] Provider: gemini, URL: http://127.0.0.1:10808/https://...
     ```

### 控制台日志说明

**成功的请求**:

```
[AI Service] Using API proxy mode for gemini (NODE_ENV: development)
[API Proxy] Using Next.js API route for gemini
POST /api/ai-proxy 200
```

**如果还是失败**:

```
[AI Proxy] Error: 502 Bad Gateway
```

这说明代理服务器 (Clash) 配置有问题,需要检查:

1. Clash 是否在运行
2. 端口号是否正确 (10808)
3. Clash 的 "允许局域网连接" 是否开启

### 环境变量

| 变量            | 开发环境      | 生产环境     |
| --------------- | ------------- | ------------ |
| `NODE_ENV`      | `development` | `production` |
| `USE_API_PROXY` | `true` ✅     | `false` ❌   |
| 支持的 AI       | 全部          | 仅 Qwen      |

### 常见问题

**Q: 为什么生产环境不能用 Gemini?**

A: 因为生产环境需要静态导出 (`output: "export"`) 用于 Tauri,而静态导出不支持 API 路由。

**Q: 如何在生产环境支持所有 AI?**

A: 需要使用 Tauri 的 HTTP 客户端,在 Rust 后端处理请求。这需要更多开发工作。

**Q: 能不能不启用代理服务器?**

A: 可以! 代理服务器的作用是:

- **Qwen**: 不需要代理,可以直接访问
- **Gemini/ChatGPT**: 国内需要代理访问

如果您在国外或者使用的是 Qwen,可以关闭代理服务器设置。

### 部署注意事项

**GitHub Pages / Vercel (静态部署)**:

```typescript
// next.config.ts
output: "export", // ✅ 启用
```

只能使用 Qwen

**Vercel (服务端)**:

```typescript
// next.config.ts
// output: "export", // ❌ 注释掉
```

可以使用所有 AI 提供商

**Tauri 桌面应用**:
需要额外实现 Rust HTTP 客户端

### 下一步

1. ✅ 重启开发服务器
2. ✅ 测试 Gemini 生成
3. ✅ 测试 ChatGPT 生成
4. ✅ 测试 Qwen 生成

所有 AI 提供商现在都应该正常工作!

### 技术支持

如遇到问题,查看浏览器控制台 (F12) 的详细日志,包含:

- API 代理模式状态
- 请求 URL (API Key 已脱敏)
- 错误详情

参考文档:

- [CORS_SOLUTION.md](./CORS_SOLUTION.md) - CORS 问题详解
- [QUICK_FIX_CORS.md](./QUICK_FIX_CORS.md) - 快速修复指南
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排查

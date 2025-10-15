# Tauri AI 代理迁移文档

## 概述

已将 Next.js API 路由 `/api/ai-proxy` 的功能迁移到 Tauri 后端,在打包应用时使用 Tauri command 来处理 AI API 请求。

## 架构变更

### 之前 (Next.js API Route)

```
前端 -> /api/ai-proxy (Next.js API Route) -> AI 提供商 API
```

### 现在 (Tauri)

```
前端 -> invoke('ai_proxy_request') -> Tauri Rust 后端 -> AI 提供商 API
```

## 实现细节

### 1. Rust 后端 (src-tauri/src/lib.rs)

实现了 `ai_proxy_request` command,支持三个 AI 提供商:

- **通义千问 (Qwen)**: `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`
- **Gemini**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **ChatGPT**: `https://api.openai.com/v1/chat/completions`

功能特性:

- 非流式请求,一次性返回完整结果
- 支持可选的 HTTP 代理配置
- 完整的错误处理和日志记录
- 使用 `reqwest` 进行 HTTP 请求
- 使用 `tokio` 异步运行时

### 2. 前端服务 (app/services/aiService.ts)

智能路由策略:

1. **Tauri 环境**: 优先使用 `generateViaTauri()` 调用 Tauri command
2. **开发环境**: 使用 `generateViaProxy()` 调用 Next.js API route
3. **生产环境**: 直接调用 AI API (仅支持 Qwen)

环境检测:

```typescript
const isTauriEnv = typeof window !== "undefined" && "__TAURI__" in window;
```

### 3. 依赖项 (src-tauri/Cargo.toml)

添加的依赖:

```toml
reqwest = { version = "0.12", features = ["json"] }
tokio = { version = "1", features = ["full"] }
```

## 使用方法

### 前端调用 (无需修改现有代码)

```typescript
import { generateArticle } from "@/app/services/aiService";

await generateArticle({
  provider: "qwen", // 或 "gemini", "chatgpt"
  apiKey: "your-api-key",
  prompt: "your prompt",
  model: "qwen-plus", // 或其他模型
  proxyUrl: "http://proxy.example.com:8080", // 可选
  onChunk: (chunk) => console.log(chunk),
  onComplete: (data) => console.log(data),
  onError: (error) => console.error(error),
});
```

代码会自动检测环境并选择合适的方法。

## 打包和运行

### 开发模式

```powershell
# 安装依赖
npm install

# 启动开发服务器 (使用 Next.js API route)
npm run dev

# 启动 Tauri 开发模式 (使用 Tauri command)
npm run tauri dev
```

### 生产构建

```powershell
# 构建 Tauri 应用
npm run tauri build
```

## 注意事项

1. **Tauri 环境下不需要 CORS 配置**: Rust 后端直接发起请求,没有浏览器跨域限制
2. **HTTP 代理支持**: 如果网络环境需要代理,可以通过 `proxyUrl` 参数传递
3. **日志记录**: Tauri 后端使用 `log` crate 记录请求详情,可在控制台查看
4. **错误处理**: 所有 API 错误都会被捕获并以统一格式返回给前端
5. **安全性**: API Key 在 Tauri 后端处理,不会暴露在前端代码中

## 文件变更清单

### 修改的文件

- ✅ `src-tauri/Cargo.toml` - 添加 reqwest 和 tokio 依赖
- ✅ `src-tauri/src/lib.rs` - 实现 AI 代理 command
- ✅ `app/services/aiService.ts` - 添加 Tauri 调用逻辑

### 保留的文件 (向后兼容)

- ✅ `app/api/ai-proxy/route.ts` - Next.js API route (开发环境仍可使用)

### 配置文件

- ✅ `src-tauri/capabilities/default.json` - 无需修改 (Rust HTTP 请求默认允许)

## 测试建议

1. **测试 Tauri 环境**:

   ```powershell
   npm run tauri dev
   ```

   在应用中测试三个 AI 提供商的请求

2. **测试开发环境**:

   ```powershell
   npm run dev
   ```

   在浏览器中测试 Next.js API route

3. **测试代理配置**:
   在设置中配置代理 URL 并测试请求

4. **检查日志**:
   - Tauri: 在终端查看 Rust 日志
   - 浏览器: 在控制台查看前端日志

## 故障排查

### 问题: Tauri command 未找到

**解决**: 确保 `lib.rs` 中的 command 已注册:

```rust
.invoke_handler(tauri::generate_handler![ai_proxy_request])
```

### 问题: 网络请求失败

**解决**:

1. 检查 API Key 是否正确
2. 检查网络连接
3. 如需代理,配置正确的代理 URL
4. 查看 Rust 日志获取详细错误信息

### 问题: 前端无法调用 Tauri API

**解决**:

1. 确保在 Tauri 环境中运行 (`npm run tauri dev`)
2. 检查是否正确导入 `@tauri-apps/api/core`
3. 验证 `isTauriEnv` 检测是否正确

## 后续优化建议

1. **流式响应**: 考虑使用 Tauri 事件系统实现流式输出
2. **缓存机制**: 在 Rust 后端添加响应缓存
3. **重试逻辑**: 添加请求失败自动重试
4. **速率限制**: 添加请求速率限制保护
5. **离线模式**: 添加离线数据支持

## 相关文档

- [Tauri Command 文档](https://tauri.app/v1/guides/features/command)
- [Reqwest 文档](https://docs.rs/reqwest/)
- [Tokio 文档](https://docs.rs/tokio/)

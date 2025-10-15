# Tauri 打包使用指南

## 快速开始

### 开发模式

#### 1. Web 开发模式 (Next.js)

```powershell
npm run dev
```

- 访问: http://localhost:3101
- 使用 Next.js API 代理 (`/api/ai-proxy`)
- 支持热重载

#### 2. Tauri 开发模式 (推荐测试打包)

```powershell
npm run tauri:dev
```

- 启动原生应用窗口
- 使用 Tauri command (`ai_proxy_request`)
- 自动重新编译 Rust 代码

### 生产构建

```powershell
# 构建 Tauri 应用
npm run tauri:build
```

构建产物位置:

- Windows: `src-tauri\target\release\bundle\msi\WriteAI_0.1.0_x64_zh-CN.msi`
- Windows (NSIS): `src-tauri\target\release\bundle\nsis\WriteAI_0.1.0_x64-setup.exe`

## AI 代理架构

### 自动环境检测

应用会自动检测运行环境并选择最佳方案:

```typescript
// 1. Tauri 环境 (打包后的应用)
if (isTauriEnv) {
  // 使用 Tauri Rust 后端
  // ✅ 无 CORS 问题
  // ✅ 原生性能
  // ✅ 支持所有 AI 提供商
}

// 2. 开发环境 (npm run dev)
else if (process.env.NODE_ENV === "development") {
  // 使用 Next.js API 代理
  // ✅ 无 CORS 问题
  // ✅ 支持所有 AI 提供商
}

// 3. 生产环境 (部署到服务器)
else {
  // 直接调用 AI API
  // ⚠️ 仅 Qwen 无 CORS 问题
  // ⚠️ 其他提供商需要后端支持
}
```

## 支持的 AI 提供商

### 1. 通义千问 (Qwen)

- ✅ Tauri 环境支持
- ✅ 开发环境支持
- ✅ 生产环境支持 (直接调用)
- 模型: `qwen-plus`, `qwen-turbo`, `qwen-max` 等

### 2. Google Gemini

- ✅ Tauri 环境支持
- ✅ 开发环境支持
- ⚠️ 生产环境需要代理
- 模型: `gemini-2.5-flash`, `gemini-pro` 等

### 3. OpenAI ChatGPT

- ✅ Tauri 环境支持
- ✅ 开发环境支持
- ⚠️ 生产环境需要代理
- 模型: `gpt-3.5-turbo`, `gpt-4` 等

## 代理配置

如果网络环境需要 HTTP 代理:

### 在设置中配置

```
代理地址: http://proxy.example.com:8080
或
代理地址: socks5://proxy.example.com:1080
```

### 代码中使用

```typescript
await generateArticle({
  provider: "qwen",
  apiKey: "your-api-key",
  prompt: "your prompt",
  model: "qwen-plus",
  proxyUrl: "http://proxy.example.com:8080", // HTTP 代理
  // ...
});
```

## 测试

### 测试 Tauri Command

1. 启动 Tauri 开发模式:

```powershell
npm run tauri:dev
```

2. 打开浏览器开发者工具 (F12)

3. 查看控制台日志,应该看到:

```
[AI Service] Using Tauri command for qwen (Tauri environment detected)
[Tauri] Calling ai_proxy_request for qwen
```

4. 检查 Rust 日志 (终端):

```
[INFO] [Tauri AI Proxy] Received request for provider: qwen
[INFO] [Tauri AI Proxy] Success, content length: 1234
```

### 使用测试脚本

在 Tauri 开发模式下,在浏览器控制台运行:

```javascript
// 参考 docs/test-tauri-proxy.js
testTauriAIProxy();
```

## 构建选项

### Debug 构建 (快速测试)

```powershell
cd src-tauri
cargo build
```

### Release 构建 (优化性能)

```powershell
npm run tauri:build
```

### 指定目标平台

```powershell
# Windows NSIS 安装包
npm run tauri:build -- --target nsis

# Windows MSI 安装包
npm run tauri:build -- --target msi

# 绿色版 (无安装器)
npm run tauri:build -- --target portable
```

## 故障排查

### 问题: Cargo 编译失败

**解决方案**:

```powershell
# 清理并重新编译
cd src-tauri
cargo clean
cargo build

# 如果还是失败,更新 Rust
rustup update
```

### 问题: 前端检测不到 Tauri 环境

**检查点**:

1. 是否使用 `npm run tauri:dev` 启动?
2. 检查控制台 `isTauriEnv` 变量
3. 确认 `@tauri-apps/api` 已安装

### 问题: AI 请求失败

**检查清单**:

- [ ] API Key 是否正确?
- [ ] 网络连接是否正常?
- [ ] 是否需要配置代理?
- [ ] 查看 Rust 日志中的详细错误信息

### 问题: 构建体积过大

**优化建议**:

1. 确保使用 Release 模式构建
2. 检查 `Cargo.toml` 中的依赖
3. 启用 LTO (Link Time Optimization)

```toml
[profile.release]
lto = true
opt-level = "z"
codegen-units = 1
```

## 性能对比

| 环境       | 方式        | 性能   | CORS      | 支持的提供商 |
| ---------- | ----------- | ------ | --------- | ------------ |
| Tauri 应用 | Rust 后端   | ⚡⚡⚡ | ✅ 无问题 | 全部支持     |
| 开发环境   | Next.js API | ⚡⚡   | ✅ 无问题 | 全部支持     |
| 生产部署   | 直接调用    | ⚡⚡⚡ | ⚠️ 有限制 | 仅 Qwen      |

## 安全建议

### API Key 存储

- ✅ 当前: 存储在应用内存中
- ⚠️ 风险: 用户可通过开发工具查看
- 💡 建议: 未来可使用系统密钥存储 (如 Windows Credential Manager)

### 网络请求

- ✅ 使用 HTTPS 加密传输
- ✅ 支持代理配置
- ✅ 完整的错误处理

## 更多信息

- 📘 详细技术文档: `docs/TAURI_MIGRATION.md`
- 📝 迁移总结: `docs/MIGRATION_SUMMARY.md`
- 🧪 测试脚本: `docs/test-tauri-proxy.js`

## 相关命令

```powershell
# 开发
npm run dev              # Next.js 开发服务器
npm run tauri:dev        # Tauri 开发模式

# 构建
npm run build            # Next.js 生产构建
npm run tauri:build      # Tauri 应用构建

# Rust 工具
cargo build              # Debug 构建
cargo build --release    # Release 构建
cargo clean              # 清理构建产物
cargo check              # 检查代码 (不编译)

# 其他
npm run lint             # ESLint 检查
```

---

更新时间: 2025-10-15
适用版本: WriteAI v0.1.0

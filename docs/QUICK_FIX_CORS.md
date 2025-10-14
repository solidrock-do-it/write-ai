# 立即解决 CORS 错误

## 问题

使用 Gemini 时遇到 CORS 跨域错误

## 快速解决方案

### 方案 A: 使用 Qwen (推荐,无需代理)

1. 打开左侧 **设置**
2. 在 "AI 提供商" 中选择 **Qwen (通义千问)**
3. 填入 Qwen API Key (从 [DashScope](https://dashscope.aliyun.com/) 获取)
4. **关闭** "使用代理服务器" 开关
5. 点击保存
6. 返回主页面,输入关键词,点击生成

**优点**: 不需要代理,没有 CORS 问题,中文效果好

### 方案 B: 使用 Next.js API 代理 (支持所有 AI)

我已经为您创建了服务端代理路由,但需要修改配置:

#### 步骤 1: 修改 Next.js 配置

编辑 `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 临时注释这一行以启用 API 路由
  // output: "export",
};

export default nextConfig;
```

#### 步骤 2: 更新 AI 服务

我会为您创建一个新的服务文件,通过 Next.js API 路由调用。

#### 步骤 3: 重启服务器

```powershell
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

然后就可以正常使用 Gemini 和 ChatGPT 了!

### 方案 C: 使用支持 CORS 的代理

某些代理软件(如 Clash Premium)支持配置 CORS 头,但配置较复杂。

## 为什么会有 CORS 错误?

浏览器的安全策略阻止了跨域请求。当您:

1. 从 `http://localhost:3101` (您的应用)
2. 访问 `https://generativelanguage.googleapis.com` (Google API)
3. 通过代理 `http://127.0.0.1:10808` (Clash)

浏览器会检查 API 响应是否包含 `Access-Control-Allow-Origin` 头,如果没有就会阻止。

## 我的建议

**对于当前项目**:

1. **开发阶段**: 使用方案 B (Next.js API 代理)
2. **生产环境**: 只提供 Qwen,不需要代理
3. **桌面应用**: 使用 Tauri 的 HTTP 客户端处理请求

详细信息请查看: [CORS_SOLUTION.md](./CORS_SOLUTION.md)

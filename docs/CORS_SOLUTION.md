# CORS 跨域问题解决方案

## 问题描述

错误信息:

```
Access to fetch at '...' from origin 'http://localhost:3101' has been blocked by CORS policy
```

这是因为浏览器端的 `fetch` API 受到同源策略限制,无法直接调用跨域的 AI API。

## 三种解决方案

### 方案 1: 使用 Next.js API 路由作为代理 (推荐)

**优点**:

- ✅ 完美解决 CORS 问题
- ✅ API Key 不会暴露在浏览器
- ✅ 支持所有代理配置
- ✅ 更安全

**缺点**:

- ❌ 需要 Node.js 服务器运行
- ❌ 不支持静态导出 (`output: "export"`)
- ❌ 不支持 Tauri 桌面应用

**实施步骤**:

1. **修改 `next.config.ts`**,移除静态导出配置:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 注释或删除这一行
  // output: "export",
};

export default nextConfig;
```

2. **API 路由已创建**: `app/api/ai-proxy/route.ts`

3. **修改客户端调用**:

更新 `app/services/aiService.ts`,使用代理路由:

```typescript
// 在文件顶部添加
const USE_PROXY_ROUTE = true; // 是否使用 Next.js 代理路由

async function generateWithGemini(options: GenerateOptions): Promise<void> {
  const { apiKey, prompt, proxyUrl, onChunk, onComplete, onError } = options;

  try {
    let apiUrl: string;
    let requestBody: any;

    if (USE_PROXY_ROUTE) {
      // 使用 Next.js API 路由作为代理
      apiUrl = "/api/ai-proxy";
      requestBody = {
        provider: "gemini",
        apiKey,
        prompt,
        proxyUrl,
      };
    } else {
      // 直接调用 (会遇到 CORS 问题)
      const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${apiKey}`;
      apiUrl = proxyUrl ? `${proxyUrl}/${baseUrl}` : baseUrl;
      requestBody = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // ... 其余代码相同
  }
}
```

4. **重启开发服务器**:

```powershell
npm run dev
```

### 方案 2: 配置代理服务器支持 CORS

**Clash 配置方法**:

修改 Clash 配置文件 (`config.yaml`),添加 HTTP 请求头重写:

```yaml
http:
  mitm:
    - "generativelanguage.googleapis.com"
    - "api.openai.com"

  url-rewrite:
    # 添加 CORS 头
    - ^https://generativelanguage.googleapis.com/ header-add Access-Control-Allow-Origin "*"
    - ^https://api.openai.com/ header-add Access-Control-Allow-Origin "*"
```

**V2Ray/Qv2ray 配置方法**:

这些代理软件通常不支持添加 CORS 头,建议使用其他方案。

### 方案 3: 使用本地 CORS 代理服务器

安装并运行 `cors-anywhere` 或类似工具:

**使用 cors-anywhere**:

```powershell
# 安装
npm install -g cors-anywhere

# 运行
cors-anywhere
```

然后在代理 URL 中填入: `http://localhost:8080`

### 方案 4: 仅使用 Qwen (通义千问)

**最简单的方案**:

如果您在国内,可以直接使用 Qwen,它不需要代理,也没有 CORS 问题:

1. 在设置中选择 **Qwen (通义千问)**
2. 填入 API Key (从 https://dashscope.aliyun.com/ 获取)
3. **关闭代理服务器**
4. 直接使用

**为什么 Qwen 没有 CORS 问题?**

- 阿里云的 DashScope API 配置了正确的 CORS 头
- 服务器在国内,不需要代理
- API 设计考虑了浏览器端调用

## 推荐方案选择

| 使用场景                               | 推荐方案                              |
| -------------------------------------- | ------------------------------------- |
| **开发环境 + 需要使用 Gemini/ChatGPT** | 方案 1: Next.js API 路由              |
| **国内用户 + 只需要中文生成**          | 方案 4: 仅使用 Qwen                   |
| **Tauri 桌面应用**                     | 需要使用 Tauri 的 HTTP 客户端         |
| **静态部署 (GitHub Pages)**            | 方案 4: 仅使用 Qwen + CORS 友好的 API |

## 当前项目的最佳实践

考虑到您的项目配置了 `output: "export"` 用于 Tauri 部署,建议:

### 短期方案

1. 开发阶段移除 `output: "export"`,使用 Next.js API 路由
2. 生产环境使用 Qwen,不需要代理

### 长期方案

如果要支持 Tauri 桌面应用 + 所有 AI 提供商,需要:

1. **使用 Tauri 的 HTTP 客户端**替代浏览器 `fetch`
2. **在 Rust 后端处理 HTTP 请求**,避开浏览器 CORS 限制

示例代码 (Tauri + Rust):

```rust
// src-tauri/src/main.rs
use tauri::command;

#[command]
async fn proxy_request(url: String, method: String, headers: serde_json::Value, body: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .proxy(reqwest::Proxy::all("http://127.0.0.1:10808").unwrap())
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .request(method.parse().unwrap(), &url)
        .headers(/* ... */)
        .body(body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    response.text().await.map_err(|e| e.to_string())
}
```

## 快速修复 (立即可用)

**如果您想立即测试**,请按以下步骤操作:

1. **使用 Qwen 替代 Gemini**:

   - 打开设置
   - 选择 "Qwen (通义千问)"
   - 填入 Qwen API Key
   - 关闭代理服务器
   - 尝试生成

2. **如果必须使用 Gemini/ChatGPT**:
   - 按照方案 1 修改配置
   - 移除 `output: "export"`
   - 重启开发服务器
   - 使用 Next.js API 路由

## 参考链接

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [CORS 详解](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Tauri HTTP 客户端](https://tauri.app/v1/guides/features/http)
- [DashScope API 文档](https://help.aliyun.com/zh/dashscope/)

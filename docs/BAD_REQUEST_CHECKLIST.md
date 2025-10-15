# Bad Request 错误排查清单

## 当前错误

```
Error response: {}
Bad Request
```

这表示 API 路由返回了 400 状态码,但客户端无法解析错误信息。

## 立即检查 (按顺序)

### ✅ 第 1 步: 重启开发服务器

**必须先做这一步!**

```powershell
# 在 dev 终端按 Ctrl+C
npm run dev
```

等待服务器完全启动,看到 "Ready" 消息。

### ✅ 第 2 步: 刷新浏览器

- 按 `Ctrl+Shift+Delete` 清除缓存
- 或按 `Ctrl+F5` 硬刷新

### ✅ 第 3 步: 查看服务端日志

在运行 `npm run dev` 的终端窗口中,应该看到:

**启动成功的日志**:

```
✓ Compiled /api/ai-proxy in XXXms
✓ Ready in XXXs
```

**如果看到编译错误**: 说明代码有问题,需要修复

### ✅ 第 4 步: 测试 API 路由

打开浏览器控制台 (F12),运行:

```javascript
fetch("/api/ai-proxy", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    provider: "gemini",
    apiKey: "test-key",
    prompt: "test prompt",
    proxyUrl: "http://127.0.0.1:10808",
  }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

**预期结果**:

- 服务端终端显示: `[API Proxy] Received request: ...`
- 浏览器控制台显示错误信息 (因为是测试 key)

**如果没有任何输出**: API 路由未正确创建

### ✅ 第 5 步: 检查文件是否存在

```powershell
Test-Path "F:\Projects\seo-projects\write-ai\app\api\ai-proxy\route.ts"
```

**应该返回**: `True`

**如果返回 False**: 文件不存在,需要重新创建

### ✅ 第 6 步: 检查配置

查看 `next.config.ts`:

```typescript
// 这一行应该被注释掉
// output: "export",
```

**如果未注释**: Next.js 无法使用 API 路由

### ✅ 第 7 步: 尝试生成文章

1. 打开设置
2. 选择 Gemini
3. 填入 API Key (真实的)
4. 启用代理: `http://127.0.0.1:10808`
5. 保存
6. 输入关键词: "人工智能"
7. 点击生成

### ✅ 第 8 步: 查看详细日志

**浏览器控制台应该显示**:

```
[API Proxy] Using Next.js API route for gemini
[API Proxy] Request payload: {
  provider: "gemini",
  hasApiKey: true,
  promptLength: 1234,
  proxyUrl: "http://127.0.0.1:10808"
}
[API Proxy] Response status: 200 或错误代码
[API Proxy] Error content-type: application/json
[API Proxy] Error response (JSON): { error: "具体错误信息" }
```

**服务端终端应该显示**:

```
[API Proxy] Received request: {
  provider: 'gemini',
  hasApiKey: true,
  hasPrompt: true,
  promptLength: 1234,
  proxyUrl: 'http://127.0.0.1:10808'
}
[AI Proxy] Provider: gemini, URL: http://127.0.0.1:10808/https://...
[AI Proxy] Request body: {"contents":[{"parts":[{"text":"...
[AI Proxy] Response status: 200 OK 或错误状态
```

## 常见问题诊断

### 问题 A: 服务端没有任何日志

**症状**: 点击生成后,服务端终端没有 `[API Proxy]` 日志

**原因**:

- 请求没有到达服务端
- API 路由路径错误
- 服务器未运行

**解决**:

1. 确认服务器正在运行
2. 检查浏览器 Network 标签,看请求是否发出
3. 检查请求 URL 是否为 `/api/ai-proxy`

### 问题 B: 服务端显示参数缺失

**症状**:

```
[API Proxy] Missing provider
```

**原因**: 客户端没有正确发送参数

**解决**:

1. 检查浏览器控制台的 `[API Proxy] Request payload`
2. 确认所有参数都有值
3. 检查 Zustand store 中的配置

### 问题 C: API Key 验证失败

**症状**:

```
[AI Proxy] Response status: 401 Unauthorized
```

**原因**: API Key 不正确

**解决**:

1. 重新获取 API Key
2. 检查是否有多余空格
3. 确认 Key 有足够配额

### 问题 D: 代理连接失败

**症状**:

```
[AI Proxy] Response status: 502 Bad Gateway
TypeError: fetch failed
```

**原因**: 无法连接到代理服务器或目标 API

**解决**:

1. 确认 Clash 正在运行
2. 测试代理: 浏览器访问 `http://127.0.0.1:9090/connections`
3. 检查 Clash 的 "允许局域网连接"
4. 尝试不同的端口: 7890, 10808, 1080
5. 更换代理节点

### 问题 E: 提示词为空

**症状**:

```
[API Proxy] promptLength: 0
```

**原因**: `generatePrompt` 函数没有生成内容

**解决**:

1. 检查是否输入了关键词
2. 查看 `app/utils/promptGenerator.ts`
3. 在浏览器控制台测试:
   ```javascript
   import { generatePrompt } from "./utils/promptGenerator";
   console.log(
     generatePrompt({
       keywords: "测试",
       articleLength: "medium",
       writingStyle: "professional",
       articleType: "blog",
     })
   );
   ```

## 如果还是不行

### 方案 1: 使用 Qwen (临时绕过)

Qwen 不需要代理,没有 CORS 问题:

1. 打开设置
2. 选择 "Qwen (通义千问)"
3. 填入 Qwen API Key (从 https://dashscope.aliyun.com/ 获取)
4. **关闭代理服务器**
5. 保存并测试

### 方案 2: 检查 Next.js 版本

```powershell
npm list next
```

确保是 15.x 版本。如果不是:

```powershell
npm install next@latest
```

### 方案 3: 清理并重建

```powershell
# 停止服务器
# 删除缓存
Remove-Item -Recurse -Force .next

# 重新启动
npm run dev
```

## 收集诊断信息

如果问题仍未解决,请收集以下信息:

1. **浏览器控制台完整日志** (从点击生成到报错)
2. **服务端终端完整日志** (包括启动信息)
3. **Network 标签的请求详情**:
   - Request URL
   - Request Headers
   - Request Payload
   - Response Headers
   - Response Body
4. **环境信息**:
   ```powershell
   node -v
   npm -v
   npm list next
   ```
5. **文件检查**:
   ```powershell
   Get-ChildItem -Path "app\api" -Recurse -File | Select-Object FullName
   ```

## 快速测试脚本

复制到浏览器控制台运行:

```javascript
// 测试 1: API 路由是否存在
fetch("/api/ai-proxy", { method: "POST", body: "{}" })
  .then((r) => console.log("API路由响应:", r.status))
  .catch((e) => console.error("API路由错误:", e));

// 测试 2: 完整请求
fetch("/api/ai-proxy", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    provider: "gemini",
    apiKey: "test",
    prompt: "test",
  }),
})
  .then((r) => r.json())
  .then((d) => console.log("完整测试:", d))
  .catch((e) => console.error("完整测试错误:", e));
```

查看输出,会显示具体的错误原因。

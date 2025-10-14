# API 代理调试指南

## 当前问题

遇到 "Bad Request" 错误,需要查看详细日志来定位问题。

## 已添加的调试日志

### 客户端日志 (浏览器控制台)

```
[API Proxy] Using Next.js API route for gemini
[API Proxy] Request payload: { provider, hasApiKey, promptLength, proxyUrl }
[API Proxy] Response status: 400
[API Proxy] Error response: { error: "..." }
```

### 服务端日志 (终端)

```
[API Proxy] Received request: { provider, hasApiKey, hasPrompt, proxyUrl }
[AI Proxy] Provider: gemini, URL: http://...
[AI Proxy] Error: 400 Bad Request
```

## 调试步骤

### 1. 重启开发服务器

**重要**: 必须重启才能应用代码更改!

```powershell
# 在 dev 终端按 Ctrl+C 停止
# 然后运行:
npm run dev
```

### 2. 打开浏览器调试工具

- 按 `F12` 打开开发者工具
- 切换到 `Console` 标签
- 勾选 "Preserve log" (保留日志)

### 3. 尝试生成文章

1. 输入关键词
2. 点击生成按钮
3. 观察控制台输出

### 4. 查看终端输出

在运行 `npm run dev` 的终端窗口中查看服务端日志。

## 常见问题诊断

### 问题 1: Missing required parameter

**症状**:

```
Error: Missing required parameter: provider
```

**原因**: 客户端没有正确传递参数

**检查**:

1. 浏览器控制台中的 `[API Proxy] Request payload`
2. 确认 provider, apiKey, prompt 都有值

**解决方案**:

- 检查 `generatePrompt` 函数是否正确生成了提示词
- 检查 Zustand store 中的 API 配置

### 问题 2: API Key 无效

**症状**:

```
[AI Proxy] Error: 401 Unauthorized
```

**原因**: API Key 不正确或已过期

**解决方案**:

1. 重新获取 API Key
2. 在设置中重新配置
3. 检查 localStorage 中的存储值

### 问题 3: 代理连接失败

**症状**:

```
[AI Proxy] Error: 502 Bad Gateway
TypeError: fetch failed
```

**原因**: 代理服务器 (Clash) 无法连接到目标 API

**解决方案**:

1. 确认 Clash 正在运行
2. 检查 Clash 的 "允许局域网连接" 是否开启
3. 测试代理: 在浏览器访问 `http://127.0.0.1:9090/connections`
4. 尝试更换代理节点
5. 检查代理端口是否正确 (10808)

### 问题 4: 提示词为空

**症状**:

```
[API Proxy] Request payload: { ..., promptLength: 0 }
```

**原因**: `generatePrompt` 函数返回了空字符串

**解决方案**:

1. 检查 `app/utils/promptGenerator.ts`
2. 确认 prompt 模板正确
3. 检查参数替换逻辑

### 问题 5: CORS 依然存在

**症状**:

```
Access to fetch at 'https://...' has been blocked by CORS policy
```

**原因**: 代码没有正确使用 API 代理

**检查**:

1. 确认 `USE_API_PROXY` 为 `true`
2. 确认 `NODE_ENV` 为 `development`
3. 控制台应该显示: `[AI Service] Using API proxy mode`

**解决方案**:

- 重启开发服务器
- 清除浏览器缓存 (Ctrl+Shift+Delete)
- 硬刷新页面 (Ctrl+F5)

## 完整日志示例

### 成功的请求

**浏览器控制台**:

```
[AI Service] Using API proxy mode for gemini (NODE_ENV: development)
[API Proxy] Using Next.js API route for gemini
[API Proxy] Request payload: {
  provider: "gemini",
  hasApiKey: true,
  promptLength: 1250,
  proxyUrl: "http://127.0.0.1:10808"
}
[API Proxy] Response status: 200
```

**服务端终端**:

```
[API Proxy] Received request: {
  provider: 'gemini',
  hasApiKey: true,
  hasPrompt: true,
  proxyUrl: 'http://127.0.0.1:10808'
}
Gemini API URL: http://127.0.0.1:10808/https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=***
POST /api/ai-proxy 200 in 2345ms
```

### 失败的请求 (API Key 错误)

**浏览器控制台**:

```
[API Proxy] Response status: 401
[API Proxy] Error response: { error: "API key not valid..." }
Generation error: Error: API key not valid...
```

**服务端终端**:

```
[AI Proxy] Error: 401 Unauthorized
POST /api/ai-proxy 401 in 234ms
```

## 检查清单

在报告问题之前,请确认:

- [ ] 已重启开发服务器
- [ ] 浏览器已刷新 (F5)
- [ ] 已打开浏览器控制台 (F12)
- [ ] 已复制完整的错误日志
- [ ] 已检查终端的服务端日志
- [ ] 已确认 API Key 正确
- [ ] 已确认代理服务器在运行 (如果使用)
- [ ] 已检查网络连接

## 获取帮助

如果问题依然存在,请提供:

1. **浏览器控制台日志** (完整的)
2. **服务端终端日志** (完整的)
3. **使用的 AI 提供商** (Qwen/Gemini/ChatGPT)
4. **是否启用代理** (是/否)
5. **代理地址** (如果使用)
6. **Node.js 版本**: `node -v`
7. **npm 版本**: `npm -v`

## 下一步

重启开发服务器后,尝试生成文章,然后查看:

1. **浏览器控制台**: 客户端发送了什么
2. **服务端终端**: 服务端收到了什么
3. **错误信息**: 具体哪里出错了

根据日志信息,可以精确定位问题!

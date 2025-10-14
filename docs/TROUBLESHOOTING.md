# 故障排查指南

## 常见错误及解决方案

### 1. "Failed to fetch" 错误

**错误描述**: 网络请求失败,无法连接到 AI API 服务器

**可能原因**:

1. **网络连接问题**: 本地网络不稳定或无法访问外网
2. **CORS 跨域问题**: 浏览器阻止了跨域请求
3. **需要代理**: 国内访问 Gemini/ChatGPT 需要代理
4. **API Key 错误**: API Key 格式不正确或已过期
5. **代理配置错误**: 代理服务器地址不正确或未运行

**解决方案**:

#### 方案 1: 配置代理服务器 (推荐)

如果你在国内访问 Gemini 或 ChatGPT,需要配置代理:

1. 确保本地代理软件正在运行 (如 Clash, V2Ray 等)
2. 点击左侧边栏的 "设置" 按钮
3. 在设置弹窗中找到 "代理服务器" 部分
4. 启用 "使用代理服务器"
5. 填写代理地址,例如:
   - `http://127.0.0.1:7890` (Clash 默认端口)
   - `http://127.0.0.1:1080` (部分 V2Ray 配置)
   - `http://localhost:7890`
6. 点击 "保存"

**注意**:

- 代理地址必须包含 `http://` 或 `https://` 前缀
- 确保代理软件的端口号与配置的一致
- Qwen (通义千问) 在国内可以直接访问,不需要代理

#### 方案 2: 检查 API Key

1. 确认 API Key 已正确复制 (没有多余的空格或换行)
2. 验证 API Key 是否有效:
   - **Qwen**: 登录 [DashScope](https://dashscope.aliyun.com/) 查看
   - **Gemini**: 登录 [Google AI Studio](https://makersuite.google.com/app/apikey) 查看
   - **ChatGPT**: 登录 [OpenAI Platform](https://platform.openai.com/api-keys) 查看
3. 检查 API Key 是否有足够的配额

#### 方案 3: 检查网络连接

打开浏览器控制台 (F12) 查看详细错误信息:

```
Console -> Network -> 找到失败的请求 -> 查看详细信息
```

### 2. "401 Unauthorized" 错误

**错误描述**: API Key 验证失败

**可能原因**:

- API Key 不正确
- API Key 已过期
- API Key 没有相应的权限

**解决方案**:

1. 重新生成 API Key
2. 确认账户状态正常
3. 检查 API Key 的权限设置

### 3. "403 Forbidden" 错误

**错误描述**: 访问被拒绝

**可能原因**:

- IP 地址被限制 (需要使用代理)
- API Key 权限不足
- 地区限制 (Gemini/ChatGPT 在部分地区不可用)

**解决方案**:

1. 启用代理服务器
2. 检查 API Key 权限
3. 确认服务在您的地区可用

### 4. "429 Too Many Requests" 错误

**错误描述**: 请求过于频繁

**可能原因**:

- 超过了 API 调用频率限制
- 账户配额已用完

**解决方案**:

1. 等待一段时间后重试
2. 升级 API 套餐
3. 检查账户余额

### 5. 生成内容格式错误

**错误描述**: AI 返回的内容无法解析

**可能原因**:

- AI 没有按照预期的 JSON 格式返回
- 提示词不够明确

**解决方案**:

1. 查看控制台输出的原始响应
2. 检查 `docs/prompt.md` 中的提示词模板
3. 尝试不同的关键词或文章类型

## 调试步骤

### 1. 查看浏览器控制台

按 `F12` 打开开发者工具,查看:

- Console 标签: 查看错误日志
- Network 标签: 查看网络请求详情

### 2. 检查 API 配置

控制台会输出 API 请求的 URL (API Key 已隐藏):

```
Qwen API URL: http://127.0.0.1:7890/https://dashscope.aliyuncs.com/...
Gemini API URL: http://127.0.0.1:7890/https://generativelanguage.googleapis.com/...
ChatGPT API URL: http://127.0.0.1:7890/https://api.openai.com/...
```

检查:

- 代理地址是否正确
- API URL 是否完整
- 是否包含 API Key (Gemini)

### 3. 测试代理连接

使用浏览器直接访问测试:

**测试 Clash 代理**:

```
http://127.0.0.1:9090/connections
```

如果能看到 JSON 数据,说明代理正在运行

### 4. 验证 API Key

**Qwen (通义千问)**:

```bash
curl -X POST https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model":"qwen-plus","input":{"messages":[{"role":"user","content":"你好"}]}}'
```

**Gemini**:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

**ChatGPT**:

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hello"}]}'
```

## 代理配置指南

### Clash

1. 打开 Clash 软件
2. 确认 "允许局域网连接" 已开启
3. 查看 "端口" 设置 (通常是 7890)
4. 在应用设置中填入: `http://127.0.0.1:7890`

### V2Ray

1. 打开 V2Ray 软件
2. 查看 HTTP 代理端口 (通常是 1080 或 10809)
3. 在应用设置中填入: `http://127.0.0.1:1080`

### 其他代理软件

查看软件的 HTTP 代理端口设置,格式为:

```
http://127.0.0.1:<端口号>
```

## API 提供商特殊说明

### Qwen (通义千问)

- ✅ 国内可以直接访问,不需要代理
- ✅ 免费额度较高
- ✅ 中文效果最好
- 推荐用于中文内容生成

### Gemini

- ⚠️ 国内需要代理访问
- ⚠️ API Key 在 URL 中传递
- ✅ Google 技术支持
- 免费额度充足

### ChatGPT

- ⚠️ 国内需要代理访问
- ⚠️ 需要付费账户
- ✅ 效果稳定可靠
- 英文内容效果最好

## 获取帮助

如果以上方案都无法解决问题:

1. 打开浏览器控制台 (F12)
2. 截图完整的错误信息
3. 记录以下信息:
   - 使用的 AI 提供商
   - 是否启用代理
   - 代理地址
   - 错误发生的步骤
4. 提交 Issue 或寻求技术支持

## 参考链接

- [DashScope 文档](https://help.aliyun.com/zh/dashscope/)
- [Gemini API 文档](https://ai.google.dev/docs)
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Clash 使用教程](https://docs.cfw.lbyczf.com/)

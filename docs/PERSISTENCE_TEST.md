# 配置持久化测试指南

## 当前持久化状态

### ✅ 已持久化的配置

根据 `app/store/articleStore.ts` 中的 `partialize` 配置,以下内容会保存到 localStorage:

1. **文章选项**

   - `articleLength` - 文章长度 (短文/中篇/长文)
   - `writingStyle` - 写作风格 (正式专业/轻松随意/学术严谨等)
   - `articleType` - 文章类型 (博客文章/新闻稿/产品描述等)

2. **API 配置**

   - `qwenApiKey` - 通义千问 API Key
   - `geminiApiKey` - Gemini API Key
   - `chatgptApiKey` - ChatGPT API Key
   - `selectedProvider` - 选中的 AI 提供商
   - `proxyEnabled` - 是否启用代理
   - `proxyUrl` - 代理服务器地址

3. **历史记录**
   - `historyItems` - 最多 50 条历史记录

### ❌ 不会持久化的内容 (临时状态)

- `keywords` - 当前输入的关键词
- `generatedContent` - 生成的内容
- `isGenerating` - 是否正在生成
- `currentGeneratedData` - 当前生成的数据

这些是临时状态,每次刷新页面会清空,这是正常的设计。

## 测试持久化功能

### 测试 1: 查看当前存储

打开浏览器控制台 (F12),运行:

```javascript
// 查看完整的存储内容
const storage = localStorage.getItem("article-storage");
console.log("存储的数据:", JSON.parse(storage));

// 查看特定配置
const data = JSON.parse(storage);
console.log("API 配置:", data.state.apiConfig);
console.log("文章选项:", {
  articleLength: data.state.articleLength,
  writingStyle: data.state.writingStyle,
  articleType: data.state.articleType,
});
console.log("历史记录数量:", data.state.historyItems?.length || 0);
```

### 测试 2: 修改并验证持久化

**步骤**:

1. **修改 API 配置**:

   - 打开设置
   - 选择 AI 提供商: Gemini
   - 填入 API Key: `test-key-12345`
   - 启用代理
   - 代理地址: `http://127.0.0.1:7890`
   - 点击保存

2. **查看控制台日志**:
   应该看到:

   ```
   [SettingsModal] Saving config: { ... }
   [SettingsModal] Config saved to store
   ```

3. **验证存储**:

   ```javascript
   const storage = JSON.parse(localStorage.getItem("article-storage"));
   console.log("已保存的 API 配置:", storage.state.apiConfig);
   // 应该显示: selectedProvider: "gemini", geminiApiKey: "test-key-12345", ...
   ```

4. **刷新页面** (F5)

5. **重新打开设置**:

   - 应该看到之前的配置被恢复
   - AI 提供商: Gemini ✓
   - API Key: test-key-12345 ✓
   - 代理已启用 ✓
   - 代理地址: http://127.0.0.1:7890 ✓

6. **查看控制台**:
   应该看到:
   ```
   [SettingsModal] Loading config from store: { ... }
   ```

### 测试 3: 文章选项持久化

**步骤**:

1. **修改文章选项**:

   - 文章长度: 选择"长文"
   - 写作风格: 选择"创意文学"
   - 文章类型: 选择"SEO 文章"

2. **刷新页面** (F5)

3. **验证恢复**:
   - 文章长度按钮应该显示"长文" ✓
   - 写作风格按钮应该显示"创意文学" ✓
   - 文章类型按钮应该显示"SEO 文章" ✓

### 测试 4: 历史记录持久化

**步骤**:

1. **生成一篇文章**:

   - 输入关键词: "人工智能"
   - 点击生成
   - 等待生成完成

2. **验证历史记录**:

   - 左侧边栏应该显示历史记录

3. **刷新页面** (F5)

4. **验证持久化**:
   - 历史记录仍然显示 ✓
   - 点击历史记录可以恢复内容 ✓

### 测试 5: 清空 localStorage

如果需要重置所有配置:

```javascript
// 清空存储
localStorage.removeItem("article-storage");

// 刷新页面
location.reload();
```

所有配置会恢复到默认值。

## 常见问题

### 问题 1: 设置没有被保存

**症状**: 保存后刷新页面,配置丢失

**可能原因**:

1. localStorage 被禁用
2. 浏览器隐私模式
3. 存储空间已满

**解决方案**:

```javascript
// 测试 localStorage 是否可用
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
  console.log("✅ localStorage 可用");
} catch (e) {
  console.error("❌ localStorage 不可用:", e);
}

// 查看存储空间
console.log(
  "存储大小:",
  new Blob([localStorage.getItem("article-storage")]).size,
  "bytes"
);
```

### 问题 2: 设置没有正确回显

**症状**: 保存后立即打开设置,看到的是旧值

**原因**: 之前的代码在模态框打开时没有重新读取配置

**解决方案**: 已修复! 现在会在模态框打开时重新加载配置。

### 问题 3: API Key 显示为空

**症状**: Input 字段是空的,但实际已保存

**原因**: Input type="password" 默认不显示内容

**解决方案**: 这是正常的。可以:

1. 重新输入来更新
2. 查看 localStorage 确认是否保存

```javascript
const storage = JSON.parse(localStorage.getItem("article-storage"));
console.log("Gemini API Key:", storage.state.apiConfig.geminiApiKey);
```

### 问题 4: 历史记录过多导致性能问题

**限制**: 最多保存 50 条记录

**验证**:

```javascript
const storage = JSON.parse(localStorage.getItem("article-storage"));
console.log("历史记录数量:", storage.state.historyItems.length);
```

如果接近 50 条,会自动删除最旧的记录。

## localStorage 结构

完整的存储结构:

```json
{
  "state": {
    "articleLength": "medium",
    "writingStyle": "professional",
    "articleType": "blog",
    "apiConfig": {
      "qwenApiKey": "",
      "geminiApiKey": "",
      "chatgptApiKey": "",
      "selectedProvider": "qwen",
      "proxyEnabled": false,
      "proxyUrl": ""
    },
    "historyItems": [
      {
        "id": "1234567890",
        "timestamp": 1234567890000,
        "keywords": "人工智能",
        "articleLength": "medium",
        "writingStyle": "professional",
        "articleType": "blog",
        "generatedData": {
          "titles": [...],
          "content": "...",
          "tags": [...]
        },
        "provider": "gemini"
      }
    ]
  },
  "version": 0
}
```

## 调试命令

### 查看完整配置

```javascript
const store = JSON.parse(localStorage.getItem("article-storage"));
console.table({
  文章长度: store.state.articleLength,
  写作风格: store.state.writingStyle,
  文章类型: store.state.articleType,
  AI提供商: store.state.apiConfig.selectedProvider,
  代理启用: store.state.apiConfig.proxyEnabled,
  代理地址: store.state.apiConfig.proxyUrl,
  历史记录数: store.state.historyItems.length,
});
```

### 修改配置 (调试用)

```javascript
const store = JSON.parse(localStorage.getItem("article-storage"));
store.state.apiConfig.selectedProvider = "gemini";
store.state.apiConfig.geminiApiKey = "your-api-key";
localStorage.setItem("article-storage", JSON.stringify(store));
location.reload(); // 刷新页面生效
```

### 导出配置 (备份)

```javascript
const config = localStorage.getItem("article-storage");
console.log("复制下面的内容保存为备份:");
console.log(config);

// 或保存到文件
const blob = new Blob([config], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "article-storage-backup.json";
a.click();
```

### 导入配置 (恢复)

```javascript
const backup = "...粘贴备份内容...";
localStorage.setItem("article-storage", backup);
location.reload();
```

## 测试清单

使用以下清单测试持久化功能:

- [ ] API 提供商选择被保存
- [ ] Qwen API Key 被保存
- [ ] Gemini API Key 被保存
- [ ] ChatGPT API Key 被保存
- [ ] 代理开关状态被保存
- [ ] 代理地址被保存
- [ ] 文章长度选择被保存
- [ ] 写作风格选择被保存
- [ ] 文章类型选择被保存
- [ ] 历史记录被保存
- [ ] 刷新页面后配置正确恢复
- [ ] 打开设置时配置正确回显
- [ ] 历史记录可以正确加载

## 总结

**✅ 持久化功能正常工作**

所有重要的配置都会保存到 `localStorage`,刷新页面后自动恢复。临时状态(如当前生成的内容)不会保存,这是合理的设计。

**🔧 最近的修复**

修复了 SettingsModal 在打开时不读取最新配置的问题,现在会正确回显已保存的配置。

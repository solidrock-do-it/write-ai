/**
 * 客户端提示词生成工具
 * 由于使用了 output: export，无法使用 API 路由
 */

import { LANGUAGE_NAMES } from "../config/languageConfig";

const PROMPT_TEMPLATE = `# AI 文章生成提示词模板

你是一位专业的内容创作者，需要根据用户提供的关键词和要求生成高质量的文章。

## 文章要求

- **关键词**: {{keywords}}
- **文章长度**: {{articleLength}}
- **写作风格**: {{writingStyle}}
- **文章类型**: {{articleType}}
- **输出语言**: {{language}} - **请使用此语言撰写所有内容（包括标题、正文和标签）**

## 输出格式要求

请严格按照以下 JSON 格式输出，不要包含任何其他文字说明：

\`\`\`json
{
  "titles": [
    {
      "title": "标题1",
      "score": 9
    },
    {
      "title": "标题2",
      "score": 8
    },
    {
      "title": "标题3",
      "score": 8
    },
    {
      "title": "标题4",
      "score": 7
    },
    {
      "title": "标题5",
      "score": 7
    }
  ],
  "content": "文章正文内容，使用 Markdown 格式...",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5", "标签6"]
}
\`\`\`

## 详细说明

### 1. titles（5个标题）
- 提供5个不同的标题选项
- 每个标题需要包含 \`title\`（标题文本）和 \`score\`（评分）
- 评分使用10分制，基于以下标准：
  - 9-10分：标题非常吸引人，SEO友好，能精准概括内容
  - 7-8分：标题较好，有一定吸引力
  - 5-6分：标题一般，基本符合要求
- 标题应该：
  - 包含核心关键词
  - 具有吸引力和点击欲望
  - 长度适中（建议15-30个字符）
  - 符合文章类型特点

### 2. content（文章内容）
根据文章长度要求生成相应字数的内容：
- **短文(short)**: 300-500字
- **中篇(medium)**: 800-1500字
- **长文(long)**: 2000字以上

根据写作风格调整语言特点：
- **正式专业(article)**: 使用专业术语，逻辑严谨，语言正式
- **轻松随意(blog)**: 语言轻松，可适当使用口语化表达，贴近读者
- **学术严谨(report)**: 引用数据，注重论证，使用学术语言
- **创意文学(creative)**: 富有想象力，使用修辞手法，文笔优美
- **营销推广(marketing)**: 突出卖点，使用号召性语言，引导行动

根据文章类型组织结构：
- **博客文章(blog)**: 引言 → 主体内容（2-3个要点）→ 总结
- **新闻稿(news)**: 导语 → 详细报道 → 背景信息
- **产品描述(product)**: 产品介绍 → 特点优势 → 使用场景 → 购买建议
- **SEO文章(seo)**: 关键词布局合理，包含小标题，段落分明
- **教程指南(tutorial)**: 步骤清晰，使用编号列表，包含注意事项

内容要求：
- 使用 Markdown 格式（支持标题、列表、加粗等）
- 结构清晰，段落分明
- 自然融入关键词，避免堆砌
- 内容原创，有价值，有深度

### 3. tags（6个标签）
- 提供6个相关标签
- 按照与内容的相关度从高到低排序
- 第1-2个标签：核心关键词
- 第3-4个标签：次要相关词
- 第5-6个标签：扩展相关词
- 标签应该：
  - 简洁明了（2-5个字）
  - 具有代表性
  - 有利于内容分类和检索

## 注意事项

1. **必须返回有效的 JSON 格式**，确保可以被 \`JSON.parse()\` 解析
2. **不要在 JSON 前后添加任何说明文字**，如 "以下是生成的内容" 等
3. **content 字段中的换行符使用 \`\\n\`**，不要使用实际换行
4. **确保所有字符串正确转义**，特别是引号、换行符等特殊字符
5. **严格遵守字数要求**，根据文章长度参数生成相应长度的内容
6. **保持内容的原创性和价值**，避免空洞和陈词滥调

现在，请根据以上要求生成文章。`;

interface PromptOptions {
  keywords: string;
  articleLength: string;
  writingStyle: string;
  articleType: string;
  language: string; // 添加语言参数
}

const lengthMap: Record<string, string> = {
  short: "短文(300-500字)",
  medium: "中篇(800-1500字)",
  long: "长文(2000字以上)",
};

const styleMap: Record<string, string> = {
  article: "正式专业",
  blog: "轻松随意",
  report: "学术严谨",
  creative: "创意文学",
  marketing: "营销推广",
};

const typeMap: Record<string, string> = {
  blog: "博客文章",
  news: "新闻稿",
  product: "产品描述",
  seo: "SEO文章",
  tutorial: "教程指南",
};

/**
 * 生成提示词
 */
export function generatePrompt(options: PromptOptions): string {
  const { keywords, articleLength, writingStyle, articleType, language } =
    options;

  let prompt = PROMPT_TEMPLATE;

  prompt = prompt
    .replace("{{keywords}}", keywords)
    .replace("{{articleLength}}", lengthMap[articleLength] || articleLength)
    .replace("{{writingStyle}}", styleMap[writingStyle] || writingStyle)
    .replace("{{articleType}}", typeMap[articleType] || articleType)
    .replace("{{language}}", LANGUAGE_NAMES[language] || language);

  return prompt;
}

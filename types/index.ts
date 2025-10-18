// AI 提供商类型
export type AIProvider = "qwen" | "gemini" | "chatgpt";

// AI 生成的标题结构
export interface AITitle {
  title: string;
  score: number; // 1-10 分制
}

// AI 生成的结构化数据
export interface AIGeneratedData {
  titles: AITitle[]; // 5个标题
  content: string; // 文章内容
  tags: string[]; // 6个标签，按相关度排序
}

// API 配置
export interface APIConfig {
  qwenApiKey: string;
  geminiApiKey: string;
  chatgptApiKey: string;
  selectedProvider: AIProvider;
  proxyEnabled: boolean;
  proxyUrl: string;
  qwenModel: string;
  geminiModel: string;
  chatgptModel: string;
}

// 历史记录项
export interface HistoryItem {
  id: string;
  timestamp: number;
  keywords: string;
  articleLength: string;
  writingStyle: string;
  articleType: string;
  language: string; // 添加语言字段
  selectedTitle?: AITitle; // 用户选择的标题
  generatedData: AIGeneratedData;
  provider: AIProvider;
}

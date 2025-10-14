import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AIProvider, AIGeneratedData, HistoryItem, APIConfig } from "../types";

// 定义文章配置状态类型
interface ArticleState {
  // 文章选项
  articleLength: string;
  writingStyle: string;
  articleType: string;
  keywords: string;

  // 生成内容
  generatedContent: string;
  isGenerating: boolean;
  currentGeneratedData: AIGeneratedData | null;

  // API 配置
  apiConfig: APIConfig;

  // 历史记录
  historyItems: HistoryItem[];

  // Actions
  setArticleLength: (value: string) => void;
  setWritingStyle: (value: string) => void;
  setArticleType: (value: string) => void;
  setKeywords: (value: string) => void;
  setGeneratedContent: (value: string) => void;
  setIsGenerating: (value: boolean) => void;
  setCurrentGeneratedData: (data: AIGeneratedData | null) => void;

  // 重置
  resetArticleOptions: () => void;

  // API 配置方法
  setAPIConfig: (config: Partial<APIConfig>) => void;

  // 历史记录方法
  addHistoryItem: (item: HistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  loadHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

// 默认值
const defaultState = {
  articleLength: "medium",
  writingStyle: "professional",
  articleType: "blog",
  keywords: "",
  generatedContent: "",
  isGenerating: false,
  currentGeneratedData: null,
  apiConfig: {
    qwenApiKey: "",
    geminiApiKey: "",
    chatgptApiKey: "",
    selectedProvider: "qwen" as AIProvider,
    proxyEnabled: false,
    proxyUrl: "",
  },
  historyItems: [],
};

export const useArticleStore = create<ArticleState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // Setters
      setArticleLength: (value) => set({ articleLength: value }),
      setWritingStyle: (value) => set({ writingStyle: value }),
      setArticleType: (value) => set({ articleType: value }),
      setKeywords: (value) => set({ keywords: value }),
      setGeneratedContent: (value) => set({ generatedContent: value }),
      setIsGenerating: (value) => set({ isGenerating: value }),
      setCurrentGeneratedData: (currentGeneratedData) =>
        set({ currentGeneratedData }),

      // 重置选项
      resetArticleOptions: () =>
        set({
          articleLength: defaultState.articleLength,
          writingStyle: defaultState.writingStyle,
          articleType: defaultState.articleType,
        }),

      // API 配置
      setAPIConfig: (config) =>
        set((state) => ({
          apiConfig: { ...state.apiConfig, ...config },
        })),

      // 历史记录方法
      addHistoryItem: (item) =>
        set((state) => ({
          historyItems: [item, ...state.historyItems].slice(0, 50), // 最多保留50条
        })),

      deleteHistoryItem: (id) =>
        set((state) => ({
          historyItems: state.historyItems.filter((item) => item.id !== id),
        })),

      loadHistoryItem: (id) => {
        const item = get().historyItems.find((h) => h.id === id);
        if (item) {
          set({
            keywords: item.keywords,
            articleLength: item.articleLength,
            writingStyle: item.writingStyle,
            articleType: item.articleType,
            currentGeneratedData: item.generatedData,
            generatedContent: item.generatedData.content,
          });
        }
      },

      clearHistory: () => set({ historyItems: [] }),
    }),
    {
      name: "article-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // 只持久化文章选项，不持久化临时状态
      partialize: (state) => ({
        articleLength: state.articleLength,
        writingStyle: state.writingStyle,
        articleType: state.articleType,
        apiConfig: state.apiConfig,
        historyItems: state.historyItems,
      }),
    }
  )
);

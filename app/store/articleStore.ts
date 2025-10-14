import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

  // Actions
  setArticleLength: (value: string) => void;
  setWritingStyle: (value: string) => void;
  setArticleType: (value: string) => void;
  setKeywords: (value: string) => void;
  setGeneratedContent: (value: string) => void;
  setIsGenerating: (value: boolean) => void;

  // 重置
  resetArticleOptions: () => void;
}

// 默认值
const defaultState = {
  articleLength: "medium",
  writingStyle: "professional",
  articleType: "blog",
  keywords: "",
  generatedContent: "",
  isGenerating: false,
};

export const useArticleStore = create<ArticleState>()(
  persist(
    (set) => ({
      ...defaultState,

      // Setters
      setArticleLength: (value) => set({ articleLength: value }),
      setWritingStyle: (value) => set({ writingStyle: value }),
      setArticleType: (value) => set({ articleType: value }),
      setKeywords: (value) => set({ keywords: value }),
      setGeneratedContent: (value) => set({ generatedContent: value }),
      setIsGenerating: (value) => set({ isGenerating: value }),

      // 重置选项
      resetArticleOptions: () =>
        set({
          articleLength: defaultState.articleLength,
          writingStyle: defaultState.writingStyle,
          articleType: defaultState.articleType,
        }),
    }),
    {
      name: "article-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // 只持久化文章选项，不持久化临时状态
      partialize: (state) => ({
        articleLength: state.articleLength,
        writingStyle: state.writingStyle,
        articleType: state.articleType,
      }),
    }
  )
);

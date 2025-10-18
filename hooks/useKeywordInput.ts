import { useRef, useEffect } from "react";

/**
 * 关键词输入 Hook
 * 处理 textarea 自动高度调整
 * 注意: keywords 状态由外部 store 管理,这里只处理 UI 交互
 */
export function useKeywordInput(
  keywords: string,
  setKeywords: (value: string) => void
) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 自动调整 textarea 高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 重置高度以获取正确的 scrollHeight
    textarea.style.height = "auto";
    // 设置最小高度 48px，最大高度 200px
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 48), 200);
    textarea.style.height = `${newHeight}px`;
  };

  // 处理 textarea 变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setKeywords(e.target.value);
    adjustTextareaHeight();
  };

  // 初始化和响应 keywords 变化时调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [keywords]);

  return {
    textareaRef,
    handleChange,
  };
}

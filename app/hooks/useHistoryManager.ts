import { useState, useRef, useCallback } from "react";
import { useArticleStore } from "../store/articleStore";
import { AITitle } from "../types";

/**
 * 历史记录管理 Hook
 * 处理历史记录的加载、删除等操作
 */
export function useHistoryManager() {
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const isLoadingHistoryRef = useRef(false);

  const { loadHistoryItem, deleteHistoryItem, updateHistoryItem } =
    useArticleStore();

  // 加载历史记录
  const handleLoadHistory = (
    id: string,
    onTitleSelected?: (title: AITitle) => void
  ) => {
    isLoadingHistoryRef.current = true;

    const savedSelectedTitle = loadHistoryItem(id);
    setCurrentHistoryId(id);

    // 如果历史记录中有保存的选中标题，使用它
    if (savedSelectedTitle && onTitleSelected) {
      onTitleSelected(savedSelectedTitle);
    }

    // 使用 requestAnimationFrame 确保在下一帧重置标志
    requestAnimationFrame(() => {
      isLoadingHistoryRef.current = false;
    });
  };

  // 删除历史记录
  const handleDeleteHistory = (id: string) => {
    deleteHistoryItem(id);
    if (currentHistoryId === id) {
      setCurrentHistoryId(null);
    }
  };

  // 更新历史记录中的选中标题
  const updateSelectedTitle = useCallback(
    (title: AITitle) => {
      if (currentHistoryId && !isLoadingHistoryRef.current) {
        updateHistoryItem(currentHistoryId, { selectedTitle: title });
      }
    },
    [currentHistoryId, isLoadingHistoryRef, updateHistoryItem]
  );

  return {
    currentHistoryId,
    setCurrentHistoryId,
    isLoadingHistoryRef,
    handleLoadHistory,
    handleDeleteHistory,
    updateSelectedTitle,
  };
}

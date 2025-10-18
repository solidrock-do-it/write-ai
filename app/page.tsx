"use client";

import React, { useState, useEffect } from "react";
import { useArticleStore } from "@/store/articleStore";
import SettingsModal from "@/components/settings/SettingsModal";
import TitleSelector from "@/components/content/TitleSelector";
import { AITitle } from "@/types";
import { downloadAsDocx } from "@/utils/contentUtils";
import {
  getSupportedLanguages,
  isLanguageSupported,
} from "@/config/languageConfig";
import { articleOptionSections } from "@/config/articleOptions";

// Hooks
import { useKeywordInput } from "@/hooks/useKeywordInput";
import { useCopyActions } from "@/hooks/useCopyActions";
import { useArticleGenerator } from "@/hooks/useArticleGenerator";
import { useHistoryManager } from "@/hooks/useHistoryManager";

// Layout Components
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";

// Editor Components
import { KeywordInput } from "@/components/editor/KeywordInput";
import {
  ArticleOptions,
  OptionSection,
} from "@/components/editor/ArticleOptions";
import { LanguageSelector } from "@/components/editor/LanguageSelector";
import { GenerateButton } from "@/components/editor/GenerateButton";

// Content Components
import { ArticleDisplay } from "@/components/content/ArticleDisplay";

export default function AIArticleGenerator() {
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<AITitle | null>(null);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});

  // Store
  const {
    articleLength,
    writingStyle,
    articleType,
    language,
    keywords,
    generatedContent,
    currentGeneratedData,
    apiConfig,
    historyItems,
    setArticleLength,
    setWritingStyle,
    setArticleType,
    setLanguage,
    setKeywords,
    setGeneratedContent,
    setCurrentGeneratedData,
    deleteHistoryItem,
    resetArticleOptions,
  } = useArticleStore();

  // Custom Hooks
  const keywordInput = useKeywordInput(keywords, setKeywords);
  const copyActions = useCopyActions();
  const articleGenerator = useArticleGenerator();
  const historyManager = useHistoryManager();

  // 获取当前模型支持的语言
  const currentModel =
    apiConfig.selectedProvider === "qwen"
      ? apiConfig.qwenModel
      : apiConfig.selectedProvider === "gemini"
      ? apiConfig.geminiModel
      : apiConfig.chatgptModel;

  const supportedLanguages = getSupportedLanguages(currentModel);

  // 当模型变更时，检查当前语言是否支持
  useEffect(() => {
    if (!isLanguageSupported(currentModel, language)) {
      setLanguage("chinese");
    }
  }, [currentModel, language, setLanguage]);

  // 当 currentGeneratedData 改变时，自动设置 selectedTitle
  useEffect(() => {
    if (historyManager.isLoadingHistoryRef.current) {
      return;
    }

    if (
      currentGeneratedData &&
      currentGeneratedData.titles &&
      currentGeneratedData.titles.length > 0
    ) {
      setSelectedTitle(currentGeneratedData.titles[0]);
    } else {
      setSelectedTitle(null);
    }
  }, [currentGeneratedData, historyManager.isLoadingHistoryRef]);

  // 当用户切换标题时，更新历史记录
  useEffect(() => {
    if (selectedTitle) {
      historyManager.updateSelectedTitle(selectedTitle);
    }
  }, [selectedTitle, historyManager.updateSelectedTitle]);

  // 当前选项值
  const currentValues = {
    articleLength,
    writingStyle,
    articleType,
  };

  // 处理选项变更
  const handleOptionChange = (stateKey: string, value: string) => {
    if (stateKey === "articleLength") setArticleLength(value);
    else if (stateKey === "writingStyle") setWritingStyle(value);
    else if (stateKey === "articleType") setArticleType(value);
  };

  // 处理生成
  const handleGenerate = async () => {
    if (!settingsOpen) {
      const success = await articleGenerator.handleGenerate((historyId) => {
        historyManager.setCurrentHistoryId(historyId);
      });

      if (!success && !articleGenerator.isGenerating) {
        setSettingsOpen(true);
      }
    }
  };

  // 新建
  const handleNew = () => {
    resetArticleOptions();
    setKeywords("");
    setGeneratedContent("");
    setCurrentGeneratedData(null);
    setSelectedTitle(null);
    historyManager.setCurrentHistoryId(null);

    requestAnimationFrame(() => {
      keywordInput.textareaRef.current?.focus();
    });
  };

  // 下载为 Word
  const handleDownload = async () => {
    console.log("[handleDownload] Button clicked");
    console.log("[handleDownload] currentGeneratedData:", currentGeneratedData);

    if (!currentGeneratedData) {
      console.log("[handleDownload] No data, returning");
      return;
    }

    try {
      const title =
        selectedTitle?.title || currentGeneratedData.titles[0]?.title || "文章";
      const tags = currentGeneratedData.tags || [];
      const content = generatedContent;

      console.log("[handleDownload] Calling downloadAsDocx with:", {
        title,
        tags,
        content: content.substring(0, 50),
      });

      await downloadAsDocx(title, tags, content);
    } catch (error) {
      console.error("Download error:", error);
      alert("下载失败，请重试");
    }
  };

  // 删除当前内容
  const handleDelete = () => {
    if (!currentGeneratedData) return;

    const confirmDelete = window.confirm(
      "确定要删除当前内容和相关历史记录吗？此操作不可恢复。"
    );

    if (confirmDelete) {
      const relatedHistory = historyItems.find(
        (item) =>
          item.generatedData.titles[0]?.title ===
            currentGeneratedData.titles[0]?.title &&
          Math.abs(item.timestamp - Date.now()) < 60000
      );

      if (relatedHistory) {
        deleteHistoryItem(relatedHistory.id);
      }

      setGeneratedContent("");
      setCurrentGeneratedData(null);
      setSelectedTitle(null);
      historyManager.setCurrentHistoryId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-secondary/5 flex">
      <div className="border-t-1 border-gray-300 h-[1px] w-full fixed z-20"></div>
      {/* 左侧边栏 */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenSettings={() => setSettingsOpen(true)}
        onNew={handleNew}
        historyItems={historyItems}
        currentHistoryId={historyManager.currentHistoryId}
        onHistoryItemClick={(id) =>
          historyManager.handleLoadHistory(id, setSelectedTitle)
        }
        onHistoryItemDelete={historyManager.handleDeleteHistory}
      />

      {/* 右侧主内容区 */}
      <MainContent sidebarOpen={sidebarOpen}>
        {/* 关键词输入区域 */}
        <div className="rounded-2xl border border-default/70 shadow-lg bg-background">
          <KeywordInput
            value={keywords}
            onChange={keywordInput.handleChange}
            textareaRef={keywordInput.textareaRef}
          />

          {/* 选项和生成按钮 */}
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex gap-2 flex-wrap">
              <ArticleOptions
                sections={articleOptionSections}
                currentValues={currentValues}
                onValueChange={handleOptionChange}
                openPopovers={openPopovers}
                setOpenPopovers={setOpenPopovers}
              />

              <LanguageSelector
                language={language}
                supportedLanguages={supportedLanguages}
                onChange={setLanguage}
                isOpen={openPopovers["language"] || false}
                onOpenChange={(open) =>
                  setOpenPopovers((prev) => ({ ...prev, language: open }))
                }
              />
            </div>

            <GenerateButton
              isGenerating={articleGenerator.isGenerating}
              disabled={!keywords}
              onGenerate={handleGenerate}
            />
          </div>
        </div>

        {/* 标题选择器 */}
        {currentGeneratedData && currentGeneratedData.titles && (
          <TitleSelector
            titles={currentGeneratedData.titles}
            selectedTitle={selectedTitle}
            onSelectTitle={setSelectedTitle}
          />
        )}

        {/* 文章显示区域 */}
        <ArticleDisplay
          generatedContent={generatedContent}
          currentGeneratedData={currentGeneratedData}
          selectedTitle={selectedTitle}
          isGenerating={articleGenerator.isGenerating}
          copySuccess={copyActions.copySuccess}
          onCopyAll={() =>
            copyActions.handleCopyAll(
              currentGeneratedData,
              selectedTitle,
              generatedContent
            )
          }
          onCopyHTML={() =>
            copyActions.handleCopyAllHTML(
              currentGeneratedData,
              selectedTitle,
              generatedContent
            )
          }
          onCopyMarkdown={() =>
            copyActions.handleCopyMarkdown(
              currentGeneratedData,
              selectedTitle,
              generatedContent
            )
          }
          onDownload={handleDownload}
          onDelete={handleDelete}
          onCopyTitle={() =>
            selectedTitle && copyActions.handleCopyTitle(selectedTitle.title)
          }
          onCopyTags={() =>
            currentGeneratedData?.tags &&
            copyActions.handleCopyAllTags(currentGeneratedData.tags)
          }
          onCopyContent={() => copyActions.handleCopyContent(generatedContent)}
        />
      </MainContent>

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

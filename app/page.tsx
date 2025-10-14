"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  FileText,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Download,
  Copy,
  RefreshCw,
  Trash2,
  Clock,
  Edit3,
  Feather,
  BookOpen,
  Newspaper,
  ShoppingCart,
  Search,
  Megaphone,
  X,
  Check,
} from "lucide-react";
import {
  Button,
  Listbox,
  ListboxItem,
  ListboxSection,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  cn,
} from "@heroui/react";
import { useArticleStore } from "./store/articleStore";
import { generateArticle } from "./services/aiService";
import SettingsModal from "./components/SettingsModal";
import TitleSelector from "./components/TitleSelector";
import { AIGeneratedData, AITitle } from "./types";
import { generatePrompt } from "./utils/promptGenerator";
import {
  copyToClipboard,
  formatFullContent,
  downloadAsDocx,
  copyAllTags,
  copyTitle,
  copyContent,
} from "./utils/contentUtils";
import {
  getSupportedLanguages,
  isLanguageSupported,
  Language,
} from "./config/languageConfig";
import { Globe } from "lucide-react";

// 定义选项数据结构
type OptionItem = {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type OptionSection = {
  title: string;
  stateKey: "articleLength" | "writingStyle" | "articleType";
  options: OptionItem[];
};

export default function AIArticleGenerator() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<AITitle | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const isLoadingHistoryRef = useRef(false); // 使用 ref 而不是 state，避免触发重新渲染
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 使用 Zustand store
  const {
    keywords,
    articleLength,
    writingStyle,
    articleType,
    language,
    generatedContent,
    isGenerating,
    currentGeneratedData,
    apiConfig,
    historyItems,
    setKeywords,
    setArticleLength,
    setWritingStyle,
    setArticleType,
    setLanguage,
    setGeneratedContent,
    setIsGenerating,
    setCurrentGeneratedData,
    addHistoryItem,
    deleteHistoryItem,
    loadHistoryItem,
    updateHistoryItem,
  } = useArticleStore();

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
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setKeywords(e.target.value);
    adjustTextareaHeight();
  };

  // 初始化和响应 keywords 变化
  useEffect(() => {
    adjustTextareaHeight();
  }, [keywords]);

  // 获取当前模型支持的语言
  const currentModel =
    apiConfig.selectedProvider === "qwen"
      ? apiConfig.qwenModel
      : apiConfig.selectedProvider === "gemini"
      ? apiConfig.geminiModel
      : apiConfig.chatgptModel;

  const supportedLanguages = getSupportedLanguages(currentModel);

  // 当模型变更时，检查当前语言是否支持，不支持则切换到中文
  useEffect(() => {
    if (!isLanguageSupported(currentModel, language)) {
      setLanguage("chinese");
    }
  }, [currentModel, language, setLanguage]);

  // 当 currentGeneratedData 改变时，自动设置 selectedTitle 为第一个标题
  useEffect(() => {
    // 如果正在加载历史记录，不执行任何操作（由 handleLoadHistoryItem 处理）
    if (isLoadingHistoryRef.current) {
      return;
    }

    if (
      currentGeneratedData &&
      currentGeneratedData.titles &&
      currentGeneratedData.titles.length > 0
    ) {
      // 用于新生成的文章，使用第一个标题
      setSelectedTitle(currentGeneratedData.titles[0]);
    } else {
      setSelectedTitle(null);
    }
  }, [currentGeneratedData]);

  // 当用户切换标题时，更新历史记录中的选中标题
  useEffect(() => {
    // 只有在不是加载历史记录时才更新
    if (currentHistoryId && selectedTitle && !isLoadingHistoryRef.current) {
      updateHistoryItem(currentHistoryId, { selectedTitle });
    }
  }, [selectedTitle, currentHistoryId, updateHistoryItem]);

  // 定义所有配置选项
  const optionSections: OptionSection[] = [
    {
      title: "文章长度",
      stateKey: "articleLength",
      options: [
        {
          key: "short",
          label: "短文",
          description: "(300-500字)",
          icon: Feather,
        },
        {
          key: "medium",
          label: "中篇",
          description: "800-1500字",
          icon: Edit3,
        },
        {
          key: "long",
          label: "长文",
          description: "2000字+",
          icon: BookOpen,
        },
      ],
    },
    {
      title: "写作风格",
      stateKey: "writingStyle",
      options: [
        {
          key: "article",
          label: "正式专业",
          description: "正式专业的文章",
          icon: FileText,
        },
        {
          key: "blog",
          label: "轻松随意",
          description: "轻松随意的博客文章",
          icon: Feather,
        },
        {
          key: "report",
          label: "学术严谨",
          description: "学术严谨的报告",
          icon: BookOpen,
        },
        {
          key: "creative",
          label: "创意文学",
          description: "富有创意的文学作品",
          icon: Sparkles,
        },
        {
          key: "marketing",
          label: "营销推广",
          description: "吸引人的营销内容",
          icon: Megaphone,
        },
      ],
    },
    {
      title: "文章类型",
      stateKey: "articleType",
      options: [
        {
          key: "blog",
          label: "博客文章",
          description: "适合发布在博客平台",
          icon: FileText,
        },
        {
          key: "news",
          label: "新闻稿",
          description: "适合新闻发布的稿件",
          icon: Newspaper,
        },
        {
          key: "product",
          label: "产品描述",
          description: "产品描述和介绍",
          icon: ShoppingCart,
        },
        {
          key: "seo",
          label: "SEO文章",
          description: "优化搜索引擎排名",
          icon: Search,
        },
        {
          key: "tutorial",
          label: "教程指南",
          description: "步骤清晰的教程指南",
          icon: BookOpen,
        },
      ],
    },
  ];

  // 处理选项点击
  const handleOptionPress = (stateKey: string, value: string) => {
    if (stateKey === "articleLength") setArticleLength(value);
    else if (stateKey === "writingStyle") setWritingStyle(value);
    else if (stateKey === "articleType") setArticleType(value);
  };

  // 根据 stateKey 获取当前选中的值
  const getCurrentValue = (stateKey: string) => {
    if (stateKey === "articleLength") return articleLength;
    if (stateKey === "writingStyle") return writingStyle;
    if (stateKey === "articleType") return articleType;
    return "";
  };

  // 根据 key 和 section 获取对应的 label
  const getOptionLabel = (section: OptionSection, key: string) => {
    const option = section.options.find((opt) => opt.key === key);
    return option?.label || key;
  };

  // 根据 key 和 section 获取对应的 icon
  const getOptionIcon = (section: OptionSection, key: string) => {
    const option = section.options.find((opt) => opt.key === key);
    return option?.icon;
  };

  const handleGenerate = async () => {
    if (!keywords.trim()) return;

    // 检查 API Key
    const selectedProvider = apiConfig.selectedProvider;
    let apiKey = "";

    if (selectedProvider === "qwen") {
      apiKey = apiConfig.qwenApiKey;
    } else if (selectedProvider === "gemini") {
      apiKey = apiConfig.geminiApiKey;
    } else if (selectedProvider === "chatgpt") {
      apiKey = apiConfig.chatgptApiKey;
    }

    if (!apiKey) {
      alert(`请先在设置中配置 ${selectedProvider} 的 API Key`);
      setSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    setCurrentGeneratedData(null);

    try {
      // 生成提示词（客户端生成）
      const prompt = generatePrompt({
        keywords,
        articleLength,
        writingStyle,
        articleType,
        language,
      });

      let accumulatedText = "";

      const model =
        selectedProvider === "qwen"
          ? apiConfig.qwenModel
          : selectedProvider === "gemini"
          ? apiConfig.geminiModel
          : apiConfig.chatgptModel;

      await generateArticle({
        provider: selectedProvider,
        apiKey,
        prompt,
        model,
        proxyUrl: apiConfig.proxyEnabled ? apiConfig.proxyUrl : undefined,
        onChunk: (chunk) => {
          accumulatedText += chunk;
          setGeneratedContent(accumulatedText);
        },
        onComplete: (data: AIGeneratedData) => {
          setCurrentGeneratedData(data);
          setGeneratedContent(data.content);

          // 保存到历史记录，默认选中第一个标题
          const historyId = Date.now().toString();
          const historyItem = {
            id: historyId,
            timestamp: Date.now(),
            keywords,
            articleLength,
            writingStyle,
            articleType,
            language,
            selectedTitle: data.titles[0], // 保存默认选中的第一个标题
            generatedData: data,
            provider: selectedProvider,
          };

          addHistoryItem(historyItem);
          setCurrentHistoryId(historyId); // 设置当前历史记录 ID
        },
        onError: (error) => {
          console.error("Generation error:", error);

          let errorMessage = "生成失败";

          // 根据错误类型提供更友好的提示
          if (error.message.includes("Failed to fetch")) {
            errorMessage = `网络请求失败,请检查:\n\n1. 网络连接是否正常\n2. API Key 是否正确\n3. 是否需要启用代理服务器\n4. 代理服务器地址是否正确 (当前: ${
              apiConfig.proxyEnabled ? apiConfig.proxyUrl : "未启用"
            })\n\n提示: 国内访问 Gemini/ChatGPT 需要使用代理`;
          } else if (error.message.includes("401")) {
            errorMessage = `API Key 验证失败,请检查:\n\n1. API Key 是否正确\n2. API Key 是否有效\n3. 是否有足够的配额`;
          } else if (error.message.includes("403")) {
            errorMessage = `访问被拒绝,请检查:\n\n1. API Key 权限是否正确\n2. 是否需要启用代理访问\n3. IP 地址是否被限制`;
          } else {
            errorMessage = `生成失败: ${error.message}`;
          }

          alert(errorMessage);
        },
      });
    } catch (error) {
      console.error("Error:", error);
      alert("生成失败,请检查控制台输出获取详细信息");
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制完整内容（标题 + 标签 + 正文）
  const handleCopyAll = async () => {
    if (!currentGeneratedData) return;

    const title =
      selectedTitle?.title || currentGeneratedData.titles[0]?.title || "";
    const tags = currentGeneratedData.tags || [];
    const content = generatedContent;

    const fullText = formatFullContent(title, tags, content);
    const success = await copyToClipboard(fullText);

    if (success) {
      setCopySuccess("all");
      setTimeout(() => setCopySuccess(null), 2000);
    } else {
      alert("复制失败，请重试");
    }
  };

  // 下载为 Word 文档
  const handleDownload = async () => {
    if (!currentGeneratedData) return;

    try {
      const title =
        selectedTitle?.title || currentGeneratedData.titles[0]?.title || "文章";
      const tags = currentGeneratedData.tags || [];
      const content = generatedContent;

      await downloadAsDocx(title, tags, content);
    } catch (error) {
      console.error("Download error:", error);
      alert("下载失败，请重试");
    }
  };

  // 删除当前内容和相关历史记录
  const handleDelete = () => {
    if (!currentGeneratedData) return;

    const confirmDelete = window.confirm(
      "确定要删除当前内容和相关历史记录吗？此操作不可恢复。"
    );

    if (confirmDelete) {
      // 查找并删除相关的历史记录
      const relatedHistory = historyItems.find(
        (item) =>
          item.generatedData.titles[0]?.title ===
            currentGeneratedData.titles[0]?.title &&
          Math.abs(item.timestamp - Date.now()) < 60000 // 1分钟内的记录
      );

      if (relatedHistory) {
        deleteHistoryItem(relatedHistory.id);
      }

      // 清空当前内容
      setGeneratedContent("");
      setCurrentGeneratedData(null);
      setSelectedTitle(null);
      setCurrentHistoryId(null); // 清空当前历史记录 ID
    }
  };

  // 复制单个标题
  const handleCopyTitle = async (title: string) => {
    const success = await copyTitle(title);
    if (success) {
      setCopySuccess(`title-${title}`);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  // 复制所有标签
  const handleCopyAllTags = async () => {
    if (!currentGeneratedData?.tags) return;
    const success = await copyAllTags(currentGeneratedData.tags);
    if (success) {
      setCopySuccess("tags");
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  // 复制正文
  const handleCopyContent = async () => {
    const success = await copyContent(generatedContent);
    if (success) {
      setCopySuccess("content");
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  // 加载历史记录的处理函数
  const handleLoadHistoryItem = (id: string) => {
    isLoadingHistoryRef.current = true; // 设置加载标志，防止 useEffect 触发更新

    const savedSelectedTitle = loadHistoryItem(id);
    setCurrentHistoryId(id);

    // 如果历史记录中有保存的选中标题，使用它
    if (savedSelectedTitle) {
      setSelectedTitle(savedSelectedTitle);
    }

    // 使用 requestAnimationFrame 确保在下一帧重置标志
    requestAnimationFrame(() => {
      isLoadingHistoryRef.current = false;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex">
      {/* 左侧边栏 */}
      <div
        className={`${
          sidebarOpen ? "w-56" : "w-14"
        } bg-white border-r border-gray-200 shadow-lg transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-10`}
      >
        {/* Logo 区域 */}
        <div className="p-2 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-sm font-bold text-gray-900">WriteAI</h1>
                <p className="text-xs text-purple-600">智能创作</p>
              </div>
            )}
          </div>
        </div>

        {/* 历史记录 */}
        <div className="flex-1 overflow-y-auto py-2 min-h-0">
          <div>
            {sidebarOpen && historyItems.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4">
                暂无记录
              </div>
            ) : (
              <div className="space-y-0">
                {historyItems.map((item) => (
                  <Tooltip
                    key={item.id}
                    placement="right"
                    showArrow
                    offset={10}
                    content={
                      <div className="p-2 max-w-xs">
                        <div className="text-xs font-semibold mb-1 text-gray-900">
                          {item.generatedData.titles[0]?.title || item.keywords}
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-4 mb-2">
                          {item.generatedData.content
                            .substring(0, 200)
                            .replace(/[#*]/g, "")
                            .trim()}
                          ...
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {item.generatedData.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    }
                  >
                    {sidebarOpen ? (
                      <div
                        className="group relative px-2 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => handleLoadHistoryItem(item.id)}
                      >
                        <div className="flex items-center justify-center gap-2 relative">
                          <Clock size={16} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">
                              {item.generatedData.titles[0]?.title ||
                                item.keywords}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHistoryItem(item.id);
                            }}
                            className="absolute right-0 my-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                          >
                            <X className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleLoadHistoryItem(item.id)}
                        className="p-1 hover:bg-gray-100 text-xs cursor-pointer flex justify-center"
                      >
                        <span className="line-clamp-2">
                          {item.generatedData.tags.slice(0, 1)[0]}
                        </span>
                      </div>
                    )}
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 设置按钮 */}
        <div className="p-1 border-t border-gray-200 flex-shrink-0">
          <Button
            onPress={() => setSettingsOpen(true)}
            variant="light"
            size="md"
            isIconOnly={!sidebarOpen}
            className="text-default/75 w-full"
          >
            <Settings size="22" />
            {sidebarOpen && <span>设置</span>}
          </Button>
        </div>

        {/* 收起/展开按钮 */}
        <div className="p-1 border-t border-gray-200 flex-shrink-0">
          <Button
            onPress={() => setSidebarOpen(!sidebarOpen)}
            variant="light"
            size="md"
            isIconOnly={!sidebarOpen}
            className="text-default/75 w-full"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft size="22" />
                <span>收起</span>
              </>
            ) : (
              <ChevronRight size="22" />
            )}
          </Button>
        </div>
      </div>

      {/* 右侧主内容区 */}
      <div
        className={`flex-1 p-4 overflow-y-auto flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-56" : "ml-14"
        }`}
      >
        <div className="w-full mx-auto space-y-4 flex-1 flex flex-col">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg h-auto">
            {/* 关键词输入区域 */}
            <div className="flex items-stretch">
              <textarea
                ref={textareaRef}
                value={keywords}
                name="keywords"
                id="keywords-input"
                rows={1}
                onChange={handleKeywordsChange}
                placeholder="请输入文章关键词..."
                className="rounded-2xl h-auto flex-1 bg-white p-3 text-gray-900 placeholder-gray-400 focus:outline-none resize-none border-none transition-[height] duration-200 ease-in-out overflow-hidden"
              />
            </div>
            {/* 关键词生成选项区域 */}
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex gap-2 flex-wrap">
                {optionSections.map((section) => {
                  const currentValue = getCurrentValue(section.stateKey);
                  const CurrentIcon = getOptionIcon(section, currentValue);
                  return (
                    <Popover
                      key={section.stateKey}
                      placement="bottom"
                      isOpen={openPopovers[section.stateKey] || false}
                      onOpenChange={(open) =>
                        setOpenPopovers((prev) => ({
                          ...prev,
                          [section.stateKey]: open,
                        }))
                      }
                    >
                      <PopoverTrigger>
                        <Button
                          variant="light"
                          size="md"
                          className="text-default/75"
                          startContent={
                            CurrentIcon && <CurrentIcon className="w-4 h-4" />
                          }
                        >
                          {getOptionLabel(section, currentValue)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Listbox
                          aria-label={section.title}
                          variant="flat"
                          selectionMode="single"
                          selectedKeys={[currentValue]}
                        >
                          <ListboxSection>
                            {section.options.map((option) => {
                              const IconComponent = option.icon;
                              return (
                                <ListboxItem
                                  key={option.key}
                                  description={option.description}
                                  startContent={
                                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                                  }
                                  onPress={() => {
                                    handleOptionPress(
                                      section.stateKey,
                                      option.key
                                    );
                                    setOpenPopovers((prev) => ({
                                      ...prev,
                                      [section.stateKey]: false,
                                    }));
                                  }}
                                  textValue={option.key}
                                >
                                  <span>{option.label}</span>
                                </ListboxItem>
                              );
                            })}
                          </ListboxSection>
                        </Listbox>
                      </PopoverContent>
                    </Popover>
                  );
                })}

                {/* 语言选择器 */}
                <Popover
                  placement="bottom"
                  isOpen={openPopovers["language"] || false}
                  onOpenChange={(open) =>
                    setOpenPopovers((prev) => ({ ...prev, language: open }))
                  }
                >
                  <PopoverTrigger>
                    <Button
                      variant="light"
                      size="md"
                      className="text-default/75"
                      startContent={<Globe className="w-4 h-4" />}
                    >
                      {supportedLanguages.find((lang) => lang.key === language)
                        ?.label || "中文"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="p-2 max-w-md">
                      <div className="text-xs font-semibold text-gray-700 mb-2">
                        输出语言（当前模型支持 {supportedLanguages.length}{" "}
                        种语言）
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {supportedLanguages.map((lang) => (
                          <Button
                            key={lang.key}
                            type="button"
                            onPress={() => {
                              setLanguage(lang.key);
                              setOpenPopovers((prev) => ({
                                ...prev,
                                language: false,
                              }));
                            }}
                            variant="light"
                            size="sm"
                          >
                            <span>{lang.label}</span>
                            {language === lang.key && (
                              <Check className="w-3 h-3 text-gray-600 flex-shrink-0" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !keywords}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      生成中
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      生成
                    </>
                  )}
                </button>
              </div>
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

          {/* 富文本编辑区域 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex-1 flex flex-col">
            <div className="border-b border-gray-200 px-4 py-1 flex items-center justify-between bg-gray-50 flex-shrink-0">
              <h2 className="text-sm font-semibold text-gray-700">生成结果</h2>
              {generatedContent && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAll}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                    title="复制全部（标题+标签+正文）"
                  >
                    {copySuccess === "all" ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                    title="下载为 Word 文档"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                    title="删除当前内容和历史记录"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="px-4 py-2 flex-1 overflow-y-auto">
              {generatedContent ? (
                <>
                  {/* 标题显示（可复制） */}
                  {selectedTitle && (
                    <div className="mb-2 pb-2 border-b border-gray-200">
                      <div className="flex items-start justify-between group">
                        <h1 className="text-2xl font-bold text-gray-900 flex-1">
                          {selectedTitle.title}
                        </h1>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyTitle(selectedTitle.title)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg"
                            title="复制此标题"
                          >
                            {copySuccess === `title-${selectedTitle.title}` ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 标签显示 */}
                  {currentGeneratedData && currentGeneratedData.tags && (
                    <div className="mb-2 pb-2 border-b border-gray-200 flex items-center justify-between group">
                      <div className="flex flex-wrap gap-2">
                        {currentGeneratedData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full border border-purple-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyAllTags()}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg"
                          title="复制全部标签"
                        >
                          {copySuccess === `tags` ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 正文显示（可复制） */}
                  <div className="group relative">
                    <div className="absolute top-0 right-0">
                      <button
                        onClick={handleCopyContent}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg"
                        title="复制正文"
                      >
                        {copySuccess === "content" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="prose prose-gray max-w-none focus:outline-none text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: generatedContent.replace(/\n/g, "<br/>"),
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Sparkles className="w-10 h-10 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      开始创作吧
                    </h3>
                    <p className="text-gray-600">
                      输入关键词，点击"生成文章"按钮，AI将为您创作精彩内容
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

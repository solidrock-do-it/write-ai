"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import {
  Button,
  Listbox,
  ListboxItem,
  ListboxSection,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from "@heroui/react";

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
  const [keywords, setKeywords] = useState("");
  const [articleLength, setArticleLength] = useState("medium");
  const [writingStyle, setWritingStyle] = useState("professional");
  const [articleType, setArticleType] = useState("blog");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedContent(
        `# ${
          keywords || "示例标题"
        }\n\n这是根据关键词"${keywords}"生成的文章内容...\n\n## 第一部分\n\n人工智能技术的快速发展正在改变我们的生活方式。从智能助手到自动驾驶，AI的应用场景越来越广泛。\n\n## 第二部分\n\n在内容创作领域，AI工具能够帮助创作者快速生成高质量的文章，极大地提升了工作效率。\n\n## 总结\n\n随着技术的不断进步，AI将在更多领域发挥重要作用，为人类社会带来更多价值。`
      );
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex">
      {/* 左侧边栏 */}
      <div
        className={`${
          sidebarOpen ? "w-44" : "w-16"
        } bg-white border-r border-gray-200 shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo 区域 */}
        <div className="p-2 border-b border-gray-200">
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
        <div className="flex-1 overflow-y-auto py-2">{/* 历史记录 */}</div>

        {/* 收起/展开按钮 */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>收起</span>
              </>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 右侧主内容区 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="w-full mx-auto space-y-4">
          {/* 关键词输入区域 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg h-auto">
            <div className="flex items-stretch">
              <textarea
                value={keywords}
                name="keywords"
                id="keywords-input"
                rows={1}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="请输入文章关键词，多个关键词用逗号分隔..."
                className=" rounded-2xl h-auto flex-1 bg-white p-3 text-gray-900 placeholder-gray-400 focus:outline-none resize-none border-none"
              />
            </div>
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="gap-2">
                {optionSections.map((section) => (
                  <Popover key={section.stateKey} placement="bottom">
                    <PopoverTrigger>
                      <Button
                        variant="light"
                        size="md"
                        className="text-default/75"
                      >
                        {articleLength}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Listbox
                        aria-label="Listbox menu with descriptions"
                        variant="flat"
                      >
                        <ListboxSection>
                          {section.options.map((option) => {
                            const IconComponent = option.icon;
                            return (
                              <ListboxItem
                                key={option.key}
                                description={sidebarOpen && option.description}
                                startContent={
                                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                                }
                                onPress={() =>
                                  handleOptionPress(
                                    section.stateKey,
                                    option.key
                                  )
                                }
                                textValue={option.key}
                              >
                                {sidebarOpen && <span>{option.label}</span>}
                              </ListboxItem>
                            );
                          })}
                        </ListboxSection>
                      </Listbox>
                    </PopoverContent>
                  </Popover>
                ))}
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

          {/* 富文本编辑区域 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">生成结果</h2>
              {generatedContent && (
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                    title="复制"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                    title="下载"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                    title="清空"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-6">
              {generatedContent ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="prose prose-gray max-w-none min-h-[500px] focus:outline-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: generatedContent.replace(/\n/g, "<br/>"),
                  }}
                />
              ) : (
                <div className="min-h-[500px] flex items-center justify-center text-center">
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
    </div>
  );
}

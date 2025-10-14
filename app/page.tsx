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
} from "lucide-react";
import { Listbox, ListboxItem, ListboxSection, cn } from "@heroui/react";

export default function AIArticleGenerator() {
  const [keywords, setKeywords] = useState("");
  const [articleLength, setArticleLength] = useState("medium");
  const [writingStyle, setWritingStyle] = useState("professional");
  const [articleType, setArticleType] = useState("blog");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  function setContentType(value: string): void {
    setArticleType(value);
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex">
      {/* 左侧边栏 */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
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

        {/* 导航菜单 */}
        <div className="flex-1 overflow-y-auto py-2">
          <Listbox aria-label="Listbox menu with descriptions" variant="flat">
            <ListboxSection showDivider title="Actions">
              <ListboxItem
                key="short"
                description={sidebarOpen && "(300-500字)"}
                startContent={<Settings className="w-5 h-5 flex-shrink-0" />}
                onPress={() => setArticleLength("short")}
                textValue="short"
              >
                {sidebarOpen && <span>短文</span>}
              </ListboxItem>
              <ListboxItem
                key="medium"
                description={sidebarOpen && "800-1500字"}
                startContent={<Settings className="w-5 h-5 flex-shrink-0" />}
                onPress={() => setArticleLength("medium")}
                textValue="medium"
              >
                {sidebarOpen && <span>中篇</span>}
              </ListboxItem>
              <ListboxItem
                key="long"
                description={sidebarOpen && "2000字+"}
                startContent={<Settings className="w-5 h-5 flex-shrink-0" />}
                onPress={() => setArticleLength("long")}
                showDivider
                textValue="long"
              >
                {sidebarOpen && <span>长文</span>}
              </ListboxItem>
            </ListboxSection>
            <ListboxSection title="Content Type">
              <ListboxItem
                key="article"
                description={sidebarOpen && "标准文章"}
                startContent={<Settings className="w-5 h-5 flex-shrink-0" />}
                onPress={() => setContentType("article")}
                textValue="article"
              >
                {sidebarOpen && <span>文章</span>}
              </ListboxItem>
              <ListboxItem
                key="blog"
                description={sidebarOpen && "博客文章"}
                startContent={<Settings className="w-5 h-5 flex-shrink-0" />}
                onPress={() => setContentType("blog")}
                textValue="blog"
              >
                {sidebarOpen && <span>博客</span>}
              </ListboxItem>
              <ListboxItem
                key="report"
                description={sidebarOpen && "报告"}
                startContent={<Settings className="w-5 h-5 flex-shrink-0" />}
                onPress={() => setContentType("report")}
                textValue="report"
              >
                {sidebarOpen && <span>报告</span>}
              </ListboxItem>
            </ListboxSection>
          </Listbox>
          {/* 配置选项 */}
          {sidebarOpen && (
            <div className="mt-6 px-2">
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase mb-3">
                  写作风格
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setWritingStyle("professional")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                      writingStyle === "professional"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    专业正式
                  </button>
                  <button
                    onClick={() => setWritingStyle("casual")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                      writingStyle === "casual"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    轻松随意
                  </button>
                  <button
                    onClick={() => setWritingStyle("academic")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                      writingStyle === "academic"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    学术严谨
                  </button>
                  <button
                    onClick={() => setWritingStyle("creative")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                      writingStyle === "creative"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    创意文学
                  </button>
                  <button
                    onClick={() => setWritingStyle("marketing")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                      writingStyle === "marketing"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    营销推广
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase mb-3">
                  文章类型
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setArticleType("blog")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                      articleType === "blog"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    博客文章
                  </button>
                  <button
                    onClick={() => setArticleType("news")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                      articleType === "news"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    新闻稿
                  </button>
                  <button
                    onClick={() => setArticleType("product")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                      articleType === "product"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    产品描述
                  </button>
                  <button
                    onClick={() => setArticleType("seo")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                      articleType === "seo"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    SEO文章
                  </button>
                  <button
                    onClick={() => setArticleType("tutorial")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                      articleType === "tutorial"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    教程指南
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

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
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* 关键词输入区域 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="flex items-stretch">
              <textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="请输入文章关键词，多个关键词用逗号分隔..."
                className="flex-1 h-32 bg-white px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none resize-none border-r border-gray-200"
              />
              <div className="flex items-center px-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !keywords}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      生成中
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      生成文章
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

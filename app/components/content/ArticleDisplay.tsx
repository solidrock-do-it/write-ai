import React from "react";
import { Sparkles } from "lucide-react";
import { ArticleToolbar } from "./ArticleToolbar";
import { ArticleHeader } from "./ArticleHeader";
import { ArticleTags } from "./ArticleTags";
import { ArticleContent } from "./ArticleContent";
import { AIGeneratedData, AITitle } from "@/app/types";

interface ArticleDisplayProps {
  generatedContent: string;
  currentGeneratedData: AIGeneratedData | null;
  selectedTitle: AITitle | null;
  isGenerating: boolean;
  copySuccess: string | null;
  onCopyAll: () => void;
  onCopyHTML: () => void;
  onCopyMarkdown: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onCopyTitle: () => void;
  onCopyTags: () => void;
  onCopyContent: () => void;
}

export function ArticleDisplay({
  generatedContent,
  currentGeneratedData,
  selectedTitle,
  isGenerating,
  copySuccess,
  onCopyAll,
  onCopyHTML,
  onCopyMarkdown,
  onDownload,
  onDelete,
  onCopyTitle,
  onCopyTags,
  onCopyContent,
}: ArticleDisplayProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex-1 flex flex-col">
      {generatedContent && (
        <ArticleToolbar
          onCopyAll={onCopyAll}
          onCopyHTML={onCopyHTML}
          onCopyMarkdown={onCopyMarkdown}
          onDownload={onDownload}
          onDelete={onDelete}
          copySuccess={copySuccess}
        />
      )}

      <div className="px-4 py-2 flex-1 overflow-y-auto">
        {generatedContent ? (
          <>
            {/* 标题显示 */}
            {selectedTitle && (
              <ArticleHeader
                title={selectedTitle.title}
                onCopy={onCopyTitle}
                copySuccess={copySuccess}
                titleKey={selectedTitle.title}
              />
            )}

            {/* 标签显示 */}
            {currentGeneratedData && currentGeneratedData.tags && (
              <ArticleTags
                tags={currentGeneratedData.tags}
                onCopyAll={onCopyTags}
                copySuccess={copySuccess}
              />
            )}

            {/* 正文显示 */}
            <ArticleContent
              content={generatedContent}
              onCopy={onCopyContent}
              copySuccess={copySuccess}
            />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isGenerating ? "正在生成中..." : "开始创作吧"}
              </h3>
              <p className="text-gray-600">
                {isGenerating
                  ? "请稍候！精彩内容即将呈现"
                  : '输入关键词，点击"生成文章"按钮，AI将为您创作精彩内容'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

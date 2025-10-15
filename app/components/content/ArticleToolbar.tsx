import React from "react";
import { Copy, Check, Download, Trash2 } from "lucide-react";
import { Button } from "@heroui/react";

interface ArticleToolbarProps {
  onCopyAll: () => void;
  onCopyHTML: () => void;
  onCopyMarkdown: () => void;
  onDownload: () => void;
  onDelete: () => void;
  copySuccess: string | null;
}

export function ArticleToolbar({
  onCopyAll,
  onCopyHTML,
  onCopyMarkdown,
  onDownload,
  onDelete,
  copySuccess,
}: ArticleToolbarProps) {
  return (
    <div className="border-b border-gray-200 px-4 py-1 flex items-center justify-between bg-gray-50 flex-shrink-0">
      <h2 className="text-sm font-semibold text-gray-700">生成结果</h2>
      <div className="flex items-center gap-2">
        <Button
          onPress={onCopyAll}
          title="复制全部（标题+标签+正文）"
          size="sm"
          color="secondary"
          variant="light"
        >
          {copySuccess === "all" ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          复制纯文本
        </Button>
        <Button
          onPress={onCopyHTML}
          title="复制 HTML（含 h1 标题、#标签、正文 HTML）"
          size="sm"
          color="secondary"
          variant="light"
        >
          {copySuccess === "all-html" ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          复制带格式
        </Button>
        <Button
          onPress={onCopyMarkdown}
          title="复制 Markdown（# 标题、#标签、Markdown 正文）"
          size="sm"
          color="secondary"
          variant="light"
        >
          {copySuccess === "all-markdown" ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          复制带md
        </Button>
        <Button
          onPress={onDownload}
          title="下载为 Word 文档"
          size="sm"
          color="secondary"
          variant="light"
          isIconOnly
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          onPress={onDelete}
          title="删除当前内容和历史记录"
          size="sm"
          color="secondary"
          variant="light"
          isIconOnly
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

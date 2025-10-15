import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@heroui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArticleContentProps {
  content: string;
  onCopy: () => void;
  copySuccess: string | null;
}

export function ArticleContent({
  content,
  onCopy,
  copySuccess,
}: ArticleContentProps) {
  return (
    <div className="group relative">
      <div className="absolute top-0 right-0">
        <Button
          onPress={onCopy}
          title="复制正文"
          size="sm"
          color="secondary"
          variant="light"
          isIconOnly
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copySuccess === "content" ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600" />
          )}
        </Button>
      </div>
      <div className="prose prose-gray max-w-none focus:outline-none text-gray-800 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

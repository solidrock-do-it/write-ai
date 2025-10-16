import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@heroui/react";

interface ArticleTagsProps {
  tags: string[];
  onCopyAll: () => void;
  copySuccess: string | null;
}

export function ArticleTags({
  tags,
  onCopyAll,
  copySuccess,
}: ArticleTagsProps) {
  return (
    <div className="mb-2 pb-2 border-b border-gray-200 flex items-center justify-between group">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full border border-purple-200"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button
          onPress={onCopyAll}
          title="复制全部标签"
          size="sm"
          color="secondary"
          variant="light"
          isIconOnly
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copySuccess === "tags" ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

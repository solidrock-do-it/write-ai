import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@heroui/react";

interface ArticleHeaderProps {
  title: string;
  onCopy: () => void;
  copySuccess: string | null;
  titleKey: string;
}

export function ArticleHeader({
  title,
  onCopy,
  copySuccess,
  titleKey,
}: ArticleHeaderProps) {
  return (
    <div className="mb-2 pb-2 border-b border-gray-200">
      <div className="flex items-start justify-between group">
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{title}</h1>
        <div className="flex items-center gap-2">
          <Button
            onPress={onCopy}
            title="复制此标题"
            size="sm"
            color="secondary"
            variant="light"
            isIconOnly
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copySuccess === `title-${titleKey}` ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

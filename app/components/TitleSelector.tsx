"use client";

import React, { useState } from "react";
import { AITitle } from "../types";
import { Star, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface TitleSelectorProps {
  titles: AITitle[];
  selectedTitle: AITitle | null;
  onSelectTitle: (title: AITitle) => void;
}

export default function TitleSelector({
  titles,
  selectedTitle,
  onSelectTitle,
}: TitleSelectorProps) {
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  if (titles.length === 0) return null;

  const handleCopyTitle = async (e: React.MouseEvent, titleText: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(titleText);
      setCopiedTitle(titleText);
      setTimeout(() => setCopiedTitle(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-2 mb-2 border border-purple-200">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900 flex-1">
          选择一个标题（AI 已生成 5 个选项）
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 hover:bg-purple-200 rounded-lg transition-colors text-purple-600"
          title={isExpanded ? "收起标题列表" : "展开标题列表"}
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>
      {isExpanded && (
        <div className="space-y-1 mt-2">
          {titles.map((title, index) => (
            <button
              key={index}
              onClick={() => onSelectTitle(title)}
              className={`w-full text-left  py-1 px-2 text-gray-500 rounded-lg transition-all group ${
                selectedTitle?.title === title.title
                  ? "bg-secondary/40 text-gray-900 shadow-lg"
                  : "bg-white hover:bg-secondary/20 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex-1">
                  {title.title}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopyTitle(e, title.title)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-purple-200 ${
                      selectedTitle?.title === title.title
                        ? "hover:bg-purple-700"
                        : ""
                    }`}
                    title="复制此标题"
                  >
                    {copiedTitle === title.title ? (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          selectedTitle?.title === title.title
                            ? "text-green-300"
                            : "text-green-600"
                        }`}
                      />
                    ) : (
                      <Copy
                        className={`w-3.5 h-3.5 ${
                          selectedTitle?.title === title.title
                            ? "text-white"
                            : "text-purple-600"
                        }`}
                      />
                    )}
                  </button>
                  <div className="flex items-center gap-1">
                    <Star
                      className={`w-4 h-4 ${
                        selectedTitle?.title === title.title
                          ? "text-yellow-300 fill-yellow-300"
                          : "text-purple-600"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        selectedTitle?.title === title.title
                          ? "text-yellow-300"
                          : "text-purple-600"
                      }`}
                    >
                      {title.score}/10
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { AITitle } from "../types";
import { Star } from "lucide-react";

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
  if (titles.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-5 h-5 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          选择一个标题（AI 已生成 5 个选项）
        </h3>
      </div>
      <div className="space-y-2">
        {titles.map((title, index) => (
          <button
            key={index}
            onClick={() => onSelectTitle(title)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              selectedTitle?.title === title.title
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white hover:bg-purple-100 text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex-1">{title.title}</span>
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
          </button>
        ))}
      </div>
    </div>
  );
}

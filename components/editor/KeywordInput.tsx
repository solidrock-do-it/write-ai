import React from "react";

interface KeywordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  placeholder?: string;
}

export function KeywordInput({
  value,
  onChange,
  textareaRef,
  placeholder = "请输入文章关键词...",
}: KeywordInputProps) {
  return (
    <div className="rounded-2xl h-auto">
      <div className="flex items-stretch">
        <textarea
          ref={textareaRef}
          value={value}
          name="keywords"
          id="keywords-input"
          rows={1}
          onChange={onChange}
          placeholder={placeholder}
          className="rounded-2xl h-auto flex-1 px-3 pt-3 focus:outline-none resize-none border-none transition-[height] duration-200 ease-in-out overflow-hidden"
        />
      </div>
    </div>
  );
}

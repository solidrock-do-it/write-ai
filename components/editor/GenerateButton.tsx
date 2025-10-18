import React from "react";
import { Wand2, RefreshCw } from "lucide-react";

interface GenerateButtonProps {
  isGenerating: boolean;
  disabled: boolean;
  onGenerate: () => void;
}

export function GenerateButton({
  isGenerating,
  disabled,
  onGenerate,
}: GenerateButtonProps) {
  return (
    <button
      onClick={onGenerate}
      disabled={isGenerating || disabled}
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
  );
}

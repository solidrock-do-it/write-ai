import React from "react";
import { Globe, Check } from "lucide-react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { Language, LanguageOption } from "@/app/config/languageConfig";

interface LanguageSelectorProps {
  language: Language;
  supportedLanguages: LanguageOption[];
  onChange: (language: Language) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageSelector({
  language,
  supportedLanguages,
  onChange,
  isOpen,
  onOpenChange,
}: LanguageSelectorProps) {
  const currentLanguage = supportedLanguages.find(
    (lang) => lang.key === language
  );

  return (
    <Popover placement="bottom" isOpen={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <Button
          variant="light"
          size="sm"
          className="text-default/75"
          startContent={<Globe className="w-4 h-4" />}
        >
          {currentLanguage?.label || "中文"}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-2 max-w-md">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            输出语言（当前模型支持 {supportedLanguages.length} 种语言）
          </div>
          <div className="grid grid-cols-5 gap-1">
            {supportedLanguages.map((lang) => (
              <Button
                key={String(lang.key)}
                type="button"
                onPress={() => {
                  onChange(lang.key);
                  onOpenChange(false);
                }}
                variant="light"
                size="sm"
              >
                <span>{lang.label}</span>
                {language === lang.key && (
                  <Check className="w-3 h-3 text-gray-600 flex-shrink-0" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
